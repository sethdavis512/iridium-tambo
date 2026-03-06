# SSR crash: `Worker is not defined` due to `react-media-recorder` dependency

## Summary

`@tambo-ai/react` crashes during server-side rendering (SSR) with `Worker is not defined` because its dependency `react-media-recorder` unconditionally imports `extendable-media-recorder`, which in turn imports `media-encoder-host` / `media-encoder-host-broker` — CJS bundles that reference the `Worker` global at module evaluation time. `Worker` does not exist in Node.js, so any SSR framework (React Router v7, Next.js, Remix, etc.) that evaluates `@tambo-ai/react` on the server will crash.

## Environment

- `@tambo-ai/react`: 1.2.0
- `react-media-recorder`: 1.7.2
- Node.js: 22.14.0
- Vite: 7.3.1
- Framework: React Router v7 (SSR mode)

## Reproduction

1. Install `@tambo-ai/react` in any SSR React app.
2. Import and render `TamboProvider` (or any export that pulls in the full package).
3. Start the dev server or build — the server-side render crashes immediately.

### Error

```
Worker is not defined
    at Object.load (node_modules/media-encoder-host-broker/build/es5/bundle.js:87:20)
    at node_modules/media-encoder-host/build/es5/bundle.js:14:48
    at node_modules/media-encoder-host/build/es5/bundle.js:2:65
    at Object.<anonymous> (node_modules/media-encoder-host/build/es5/bundle.js:5:3)
    at Module._compile (node:internal/modules/cjs/loader:1554:14)
```

## Root cause

The dependency chain is:

```
@tambo-ai/react
  └─ react-media-recorder (1.7.2)
       └─ extendable-media-recorder
            └─ media-encoder-host
                 └─ media-encoder-host-broker
                      → new Worker(...)  // crashes in Node
```

`react-media-recorder/index.js` is a CJS module that eagerly `require()`s `extendable-media-recorder` at the top level. There is no conditional check for a browser environment, so the entire chain evaluates — including the `new Worker(...)` call — even when the module is loaded on the server.

Additionally, `@tambo-ai/react`'s own `package.json` import (used internally) lacks a `type: "json"` import attribute, which causes a separate `"needs an import attribute of type: json"` error in Node ESM mode. This forces consumers to add `@tambo-ai/react` to Vite's `ssr.noExternal` (or equivalent bundler config), which then exposes the `Worker` crash because the transitive deps get bundled too.

## Workaround

We worked around both issues with a custom Vite plugin that shims the browser-only modules to empty exports during SSR:

```ts
// vite.config.ts
const BROWSER_ONLY_MODULES = [
    'react-media-recorder',
    'extendable-media-recorder',
    'media-encoder-host',
    'media-encoder-host-broker',
];

export default defineConfig({
    plugins: [
        {
            name: 'ssr-browser-shim',
            enforce: 'pre',
            resolveId(id, _importer, options) {
                if (
                    options?.ssr &&
                    BROWSER_ONLY_MODULES.some(
                        (m) => id === m || id.startsWith(m + '/'),
                    )
                ) {
                    return '\0ssr-empty';
                }
            },
            load(id) {
                if (id === '\0ssr-empty') return 'export default {}';
            },
        },
    ],
    ssr: {
        noExternal: [
            '@tambo-ai/react',
            'react-media-recorder',
            'extendable-media-recorder',
            'media-encoder-host',
            'media-encoder-host-broker',
        ],
    },
});
```

Key details:

- `enforce: 'pre'` is required so the shim runs before Vite's default resolver.
- All packages in the chain must appear in both `BROWSER_ONLY_MODULES` and `ssr.noExternal`, otherwise Node's native CJS loader picks them up directly, bypassing the plugin.

## Additional issue: production build fails with named export error

The `export default {}` shim above is sufficient for Vite's dev server, but **Rollup's production build** (used by `react-router build` / `vite build`) performs strict named-export validation. Because `@tambo-ai/react` uses a named import:

```js
import { useReactMediaRecorder } from "react-media-recorder";
```

…the SSR build fails with:

```
RollupError: "useReactMediaRecorder" is not exported by "ssr-empty",
imported by "node_modules/@tambo-ai/react/esm/hooks/use-tambo-voice.js".
```

### Fix

The shim module must re-export a stub for every named binding that downstream code imports. For `react-media-recorder` the only named import used by `@tambo-ai/react` is `useReactMediaRecorder`:

```ts
load(id) {
    if (id === '\0ssr-empty')
        return 'export default {}; export const useReactMediaRecorder = () => ({});';
},
```

This satisfies Rollup's static analysis while keeping the module inert during SSR.

## Suggested fixes

1. **Lazy-load `react-media-recorder`**: The voice recording hook (`use-tambo-voice.tsx`) should dynamically `import()` `react-media-recorder` only when voice features are actually used in the browser, rather than importing it at the top level. This would prevent the entire media-encoder chain from being evaluated during SSR.

2. **Add `"type": "json"` import attribute**: The internal `package.json` import in `@tambo-ai/react` should include the proper import attribute so it works natively in Node ESM without requiring `ssr.noExternal`.

3. **Consider making `react-media-recorder` an optional/peer dependency**: Not all consumers use voice features. Making it optional would reduce the install footprint and eliminate the SSR issue for the majority of users.
