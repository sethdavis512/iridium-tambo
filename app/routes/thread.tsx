import {
    ComponentRenderer,
    useTambo,
    useTamboThreadInput,
} from '@tambo-ai/react';
import type {
    Content,
    TamboComponentContent,
    TamboToolUseContent,
    ToolResultContent,
} from '@tambo-ai/react';
import {
    CircleXIcon,
    LoaderCircleIcon,
    SendHorizonalIcon,
    StopCircleIcon,
    WrenchIcon,
    XIcon,
} from 'lucide-react';
import { ChatBubble } from '~/components/ChatBubble';
import { Markdown } from '~/components/Markdown';
import { NoteToolPart } from '~/components/NoteToolPart';
import type { Route } from './+types/thread';
import { authMiddleware } from '~/middleware/auth';
import { getUserFromSession } from '~/models/session.server';
import invariant from 'tiny-invariant';
import { isRouteErrorResponse, useRouteError } from 'react-router';
import { useEffect, useRef, useState } from 'react';

const PRESET_MESSAGES = [
    {
        label: 'Summarize',
        value: 'Summarize our conversation so far as a concise bullet-point list.',
    },
    {
        label: 'Explain',
        value: 'Explain your last response in simpler terms and include a concrete real-world example.',
    },
    {
        label: 'Pros & Cons',
        value: 'Give me a structured pros and cons list for the main topic we have been discussing.',
    },
    {
        label: 'Next Steps',
        value: 'Based on everything we have discussed, what are the most important next steps I should take?',
    },
    {
        label: 'My Notes',
        value: 'List all of my saved notes and give me a brief summary of what each one contains.',
    },
    {
        label: 'Save Note',
        value: 'Create a note capturing the key insights and action items from our conversation so far.',
    },
];

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ request, params }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    invariant(user, 'User could not be found in session');

    return { threadId: params.threadId };
}

const NOTE_TOOLS = new Set(['create_note', 'list_notes', 'search_notes']);

function ToolPartFallback({
    name,
    completed,
}: {
    name: string;
    completed: boolean;
}) {
    return (
        <div className="mt-1 flex items-center gap-1 text-xs opacity-70">
            <WrenchIcon aria-hidden="true" className="h-3 w-3" />
            <span>
                {name}
                {completed ? ' \u2713' : ' \u2026'}
            </span>
        </div>
    );
}

/** Extract the first JSON-parseable result from a tool_result content array. */
function parseToolResult(
    content: ToolResultContent['content'],
): Record<string, unknown> | undefined {
    for (const block of content) {
        if (block.type === 'text') {
            try {
                const parsed = JSON.parse(block.text);
                if (parsed && typeof parsed === 'object') {
                    return parsed as Record<string, unknown>;
                }
            } catch {
                // not JSON, skip
            }
        }
    }
    return undefined;
}

export default function ThreadRoute({ params }: Route.ComponentProps) {
    const messageRef = useRef<HTMLDivElement>(null);

    const {
        messages,
        isIdle,
        isStreaming,
        isWaiting,
        currentThreadId,
        switchThread,
        cancelRun,
        streamingState,
    } = useTambo();

    const { value, setValue, submit, isPending } = useTamboThreadInput();

    // Switch Tambo's active thread when the route param changes.
    useEffect(() => {
        switchThread(params.threadId);
    }, [params.threadId, switchThread]);

    // Auto-scroll to bottom on new messages.
    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.scrollTop = messageRef.current.scrollHeight;
        }
    }, [messages]);

    // Track error dismissal; reset when a new error arrives.
    const [errorDismissed, setErrorDismissed] = useState(false);
    useEffect(() => {
        setErrorDismissed(false);
    }, [streamingState.error]);
    const showError = streamingState.error && !errorDismissed;

    const handleSend = async () => {
        if (!value.trim()) return;
        await submit();
        setValue('');
    };

    // For preset buttons: setValue then submit after React flushes the update.
    const sendPreset = (text: string) => {
        setValue(text);
        setTimeout(() => submit(), 0);
    };

    const isActive = isStreaming || isWaiting || isPending;

    return (
        <>
            {showError && (
                <div role="alert" className="alert alert-error">
                    <CircleXIcon aria-hidden="true" className="h-6 w-6" />
                    <span>
                        {streamingState.error?.message ??
                            'Something went wrong.'}
                    </span>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setErrorDismissed(true)}
                    >
                        <XIcon aria-hidden="true" className="h-4 w-4" />
                        Dismiss
                    </button>
                </div>
            )}
            <div
                ref={messageRef}
                aria-live="polite"
                aria-busy={isStreaming}
                className="rounded-box bg-base-100 flex min-h-0 grow flex-col gap-4 overflow-y-auto p-4"
            >
                {/* Spacer pushes messages to the bottom. Using justify-end with
                   overflow-y-auto causes upward overflow that is unreachable
                   by scrolling, so we use a grow spacer instead. */}
                <div className="grow" />
                {messages.length > 0 ? (
                    messages.map((message) => {
                        const isUser = message.role === 'user';

                        // Skip messages that only contain tool_result blocks
                        // (tool results are rendered alongside their tool_use in another message).
                        const hasVisibleContent =
                            message.content.length > 0 &&
                            message.content.some(
                                (b: Content) =>
                                    b.type !== 'tool_result',
                            );

                        if (!hasVisibleContent) return null;

                        // Build a lookup from toolUseId → tool_result for this message.
                        const toolResults = new Map<
                            string,
                            ToolResultContent['content']
                        >();
                        message.content.forEach((block: Content) => {
                            if (block.type === 'tool_result') {
                                const r = block as ToolResultContent;
                                toolResults.set(r.toolUseId, r.content);
                            }
                        });

                        const content = (
                            <>
                                {message.content.map(
                                    (block: Content, i: number) => {
                                        if (block.type === 'text') {
                                            return block.text ? (
                                                <Markdown key={i}>
                                                    {block.text}
                                                </Markdown>
                                            ) : null;
                                        }

                                        if (block.type === 'component') {
                                            const c =
                                                block as TamboComponentContent;
                                            return (
                                                <ComponentRenderer
                                                    key={c.id}
                                                    content={c}
                                                    threadId={currentThreadId}
                                                    messageId={message.id}
                                                />
                                            );
                                        }

                                        if (block.type === 'tool_use') {
                                            const t =
                                                block as TamboToolUseContent;
                                            const resultContent =
                                                toolResults.get(t.id);
                                            const completed =
                                                t.hasCompleted ?? false;
                                            const output = resultContent
                                                ? parseToolResult(resultContent)
                                                : undefined;

                                            if (NOTE_TOOLS.has(t.name)) {
                                                return (
                                                    <NoteToolPart
                                                        key={t.id}
                                                        toolName={t.name}
                                                        state={
                                                            completed
                                                                ? 'output-available'
                                                                : 'input-available'
                                                        }
                                                        output={output}
                                                    />
                                                );
                                            }
                                            return (
                                                <ToolPartFallback
                                                    key={t.id}
                                                    name={t.name}
                                                    completed={completed}
                                                />
                                            );
                                        }

                                        // tool_result blocks are rendered via tool_use above.
                                        return null;
                                    },
                                )}
                            </>
                        );

                        return (
                            <ChatBubble
                                key={message.id}
                                variant={isUser ? 'primary' : 'default'}
                                placement={isUser ? 'end' : 'start'}
                            >
                                {content}
                            </ChatBubble>
                        );
                    })
                ) : (
                    <div className="text-center text-gray-500">
                        No messages yet
                    </div>
                )}
                {/* Waiting indicator before the first token arrives */}
                {isWaiting && messages.length > 0 && (
                    <ChatBubble variant="default" placement="start">
                        <span role="status" aria-label="Loading response">
                            <LoaderCircleIcon
                                aria-hidden="true"
                                className="h-5 w-5 animate-spin"
                            />
                        </span>
                    </ChatBubble>
                )}
            </div>
            <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap gap-1.5 px-1">
                    {PRESET_MESSAGES.map(({ label, value: presetValue }) => (
                        <button
                            key={label}
                            type="button"
                            className="btn btn-content rounded-box btn-xs"
                            onClick={() => sendPreset(presetValue)}
                            disabled={!isIdle}
                            title={presetValue}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="rounded-box border-base-300 bg-base-100 flex items-center gap-2 border p-2">
                    <input
                        id="chat-message-input"
                        type="text"
                        aria-label="Message"
                        className="input rounded-field grow"
                        placeholder="Your message here..."
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        disabled={isActive}
                    />
                    <button
                        className="btn btn-default"
                        onClick={() => cancelRun()}
                        disabled={!isActive}
                    >
                        <StopCircleIcon
                            aria-hidden="true"
                            className="h-6 w-6"
                        />{' '}
                        Stop
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={handleSend}
                        disabled={isActive}
                    >
                        <SendHorizonalIcon
                            aria-hidden="true"
                            className="h-6 w-6"
                        />{' '}
                        Send
                    </button>
                </div>
            </div>
        </>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();

    if (isRouteErrorResponse(error)) {
        return (
            <div role="alert" className="alert alert-error">
                <CircleXIcon aria-hidden="true" className="h-6 w-6" />
                <span>
                    {error.status} {error.statusText}
                </span>
            </div>
        );
    }

    return (
        <div role="alert" className="alert alert-error">
            <CircleXIcon aria-hidden="true" className="h-6 w-6" />
            <span>
                Experiencing technical difficulties. Please try again later.
            </span>
        </div>
    );
}
