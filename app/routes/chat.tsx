import { Container } from '~/components/Container';
import { authMiddleware } from '~/middleware/auth';
import { listItemClassName, navLinkClassName } from '~/shared';
import type { Route } from './+types/chat';
import { deleteThread } from '~/models/thread.server';
import { getUserFromSession } from '~/models/session.server';
import invariant from 'tiny-invariant';
import { Form, NavLink, Outlet, redirect, useNavigate } from 'react-router';
import { LoaderCircleIcon, PlusCircleIcon, Trash2Icon } from 'lucide-react';
import { useTambo, useTamboThreadList } from '@tambo-ai/react';

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User could not be found in session');

    return null;
}

export async function action({ request }: Route.ActionArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User could not be found in session');

    const form = await request.formData();
    const intent = String(form.get('intent'));

    if (request.method === 'POST' && intent === 'delete-thread') {
        const threadId = String(form.get('threadId'));
        await deleteThread(threadId, user.id);

        return redirect('/chat');
    }

    return null;
}

function getThreadLabel(thread: { name?: string }): string {
    return thread.name || 'New Thread';
}

export default function ChatRoute() {
    const navigate = useNavigate();
    const { startNewThread } = useTambo();
    const { data, isLoading } = useTamboThreadList();

    const threads = data?.threads ?? [];

    const handleNewThread = () => {
        const threadId = startNewThread();
        navigate(threadId);
    };

    return (
        <>
            <title>Chat | Iridium</title>
            <meta name="description" content="This is the chat page" />
            <Container className="flex h-full flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="mb-4 text-4xl font-bold">Chat</h1>
                    </div>
                    <button
                        className="btn btn-accent"
                        type="button"
                        onClick={handleNewThread}
                    >
                        <PlusCircleIcon
                            aria-hidden="true"
                            className="mr-2 h-6 w-6"
                        />
                        New Thread
                    </button>
                </div>
                <div className="grid min-h-0 grow grid-cols-1 grid-rows-[auto_1fr] gap-4 md:grid-cols-12 md:grid-rows-none">
                    <div className="col-span-1 overflow-y-auto md:col-span-5 lg:col-span-4">
                        <nav aria-label="Conversations">
                            {isLoading ? (
                                <div className="flex justify-center p-4">
                                    <LoaderCircleIcon
                                        aria-hidden="true"
                                        className="h-6 w-6 animate-spin"
                                    />
                                </div>
                            ) : (
                                <ul className="flex flex-col gap-4">
                                    {threads.length > 0 ? (
                                        threads.map((thread) => (
                                            <li
                                                key={thread.id}
                                                className="group relative"
                                            >
                                                <NavLink
                                                    to={thread.id}
                                                    className={navLinkClassName}
                                                >
                                                    <span className="truncate pr-6">
                                                        {getThreadLabel(thread)}
                                                    </span>
                                                </NavLink>
                                                <Form
                                                    method="POST"
                                                    className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100"
                                                >
                                                    <input
                                                        type="hidden"
                                                        name="intent"
                                                        value="delete-thread"
                                                    />
                                                    <input
                                                        type="hidden"
                                                        name="threadId"
                                                        value={thread.id}
                                                    />
                                                    <button
                                                        type="submit"
                                                        aria-label="Delete thread"
                                                        className="btn btn-ghost btn-xs text-error"
                                                    >
                                                        <Trash2Icon className="h-4 w-4" />
                                                    </button>
                                                </Form>
                                            </li>
                                        ))
                                    ) : (
                                        <li className={listItemClassName}>
                                            No threads found
                                        </li>
                                    )}
                                </ul>
                            )}
                        </nav>
                    </div>
                    <div className="col-span-1 flex min-h-0 flex-col gap-4 overflow-hidden md:col-span-7 lg:col-span-8">
                        <Outlet />
                    </div>
                </div>
            </Container>
        </>
    );
}
