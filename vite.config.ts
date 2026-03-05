import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// These packages use browser-only globals (Worker, etc.) and must be
// shimmed to empty modules when bundled for SSR.
const BROWSER_ONLY_MODULES = [
    'react-media-recorder',
    'extendable-media-recorder',
    'media-encoder-host',
    'media-encoder-host-broker',
];

export default defineConfig({
    plugins: [
        tailwindcss(),
        reactRouter(),
        tsconfigPaths(),
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
        // Bundle @tambo-ai/react so Vite transforms its `import pkg from './package.json'`
        // calls itself, avoiding Node ESM's "type: json" import attribute requirement.
        // Browser-only transitive deps must also be listed so the shim plugin can intercept them.
        noExternal: [
            '@tambo-ai/react',
            'react-media-recorder',
            'extendable-media-recorder',
            'media-encoder-host',
            'media-encoder-host-broker',
        ],
    },
});
