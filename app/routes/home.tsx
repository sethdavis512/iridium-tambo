import { Container } from '~/components/Container';

export default function Home() {
    return (
        <>
            <title>Home | Iridium</title>
            <meta
                name="description"
                content="Iridium is a full-stack React starter kit with authentication, AI chat, agent tools, and production-ready patterns."
            />
            <Container className="p-4">
                <h1 className="mb-4 text-4xl font-bold">Iridium</h1>
                <p className="mb-8 text-lg">
                    A full-stack starter kit built for shipping AI-powered
                    products. Clone the repo, configure your environment, and
                    have a working application with authentication, AI chat, and
                    agent tools in minutes.
                </p>

                <h2 className="mb-3 text-2xl font-semibold">
                    What is included
                </h2>
                <p className="mb-4">
                    Iridium ships with a complete authentication system, an AI
                    chat interface with agent tools, persistent notes, and a set
                    of production-ready patterns for forms, error handling, and
                    role-based access control.
                </p>
                <ul className="mb-8 list-inside list-disc space-y-2">
                    <li>
                        Sign in and sign up with email and password via Better
                        Auth. Sessions are secure, HTTP-only, and automatically
                        refreshed.
                    </li>
                    <li>
                        Role-based access control with USER, EDITOR, and ADMIN
                        roles baked into the database schema and session
                        helpers.
                    </li>
                    <li>
                        AI chat powered by Tambo AI. Messages are organized into
                        threads so conversations are never lost.
                    </li>
                    <li>
                        Agent tools that let the AI assistant take actions on
                        behalf of the user. The included note tools demonstrate
                        the full pattern: tool definition, database mutation,
                        and inline tool UI rendering.
                    </li>
                    <li>
                        A browsable Notes page where users can see everything
                        the agent has saved for them, completing the tool-to-UI
                        vertical slice.
                    </li>
                    <li>
                        The agent can save, search, and retrieve notes on your
                        behalf across any conversation using the included note
                        tools, backed by PostgreSQL.
                    </li>
                    <li>
                        Client and server-side form validation using Zod and
                        React Hook Form, with a working example in the Form
                        route.
                    </li>
                </ul>

                <h2 className="mb-3 text-2xl font-semibold">The stack</h2>
                <p className="mb-4">
                    Every technology was chosen to keep the codebase type-safe
                    from database to UI. Prisma generates types from the schema,
                    Zod validates runtime data, React Router 7 types routes and
                    loaders, and CVA ensures type-safe component variants.
                </p>
                <ul className="mb-8 list-inside list-disc space-y-2">
                    <li>React Router v7 with SSR and config-based routing</li>
                    <li>
                        PostgreSQL via Prisma, schema at prisma/schema.prisma
                    </li>
                    <li>
                        Tambo AI for thread management, streaming, and tool
                        execution
                    </li>
                    <li>Tailwind CSS v4 and DaisyUI v5 for styling</li>
                    <li>
                        Bun for local development, Node 20 Alpine for production
                    </li>
                </ul>

                <h2 className="mb-3 text-2xl font-semibold">
                    Adding your own tools
                </h2>
                <p className="mb-4">
                    The included note tools show the complete pattern for
                    extending the agent. To add a new tool:
                </p>
                <ol className="mb-8 list-inside list-decimal space-y-2">
                    <li>
                        Define a Prisma model in{' '}
                        <code>prisma/schema.prisma</code> and run a migration.
                    </li>
                    <li>
                        Create a server data access module in{' '}
                        <code>app/models/</code>.
                    </li>
                    <li>
                        Add a tool definition in <code>app/lib/tambo.ts</code>{' '}
                        and register it with the TamboProvider.
                    </li>
                    <li>
                        Build a tool UI component in{' '}
                        <code>app/components/</code> and route it in the chat
                        thread view.
                    </li>
                    <li>
                        Optionally add a route page to browse the records
                        outside of chat.
                    </li>
                </ol>

                <h2 className="mb-3 text-2xl font-semibold">Getting started</h2>
                <p>
                    Install dependencies with <code>bun install</code>, run
                    migrations with <code>bunx prisma migrate dev</code>, seed
                    the database with <code>bunx prisma db seed</code>, and
                    start the dev server with <code>bun run dev</code>. The app
                    will be available at <code>http://localhost:5173</code>.
                </p>
            </Container>
        </>
    );
}
