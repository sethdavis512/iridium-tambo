import { getUserFromSession } from '~/models/session.server';
import {
    createNote,
    getNotesByUserId,
    searchNotes,
} from '~/models/note.server';
import type { Route } from './+types/api-notes';

function serializeNote(n: {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
}) {
    return {
        id: n.id,
        title: n.title,
        content: n.content,
        createdAt: n.createdAt,
    };
}

export async function loader({ request }: Route.LoaderArgs) {
    const user = await getUserFromSession(request);
    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const q = url.searchParams.get('q');

    if (q !== null) {
        const notes = await searchNotes({ userId: user.id, query: q });
        return Response.json({ notes: notes.map(serializeNote) });
    }

    const notes = await getNotesByUserId(user.id);
    return Response.json({ notes: notes.map(serializeNote) });
}

export async function action({ request }: Route.ActionArgs) {
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const user = await getUserFromSession(request);
    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: { title?: unknown; content?: unknown };
    try {
        body = await request.json();
    } catch {
        return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { title, content } = body;
    if (typeof title !== 'string' || !title.trim()) {
        return Response.json(
            { error: 'title must be a non-empty string' },
            { status: 400 },
        );
    }
    if (typeof content !== 'string' || !content.trim()) {
        return Response.json(
            { error: 'content must be a non-empty string' },
            { status: 400 },
        );
    }

    const note = await createNote({ title, content, userId: user.id });
    return Response.json(serializeNote(note), { status: 201 });
}
