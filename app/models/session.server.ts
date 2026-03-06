import { auth } from '~/lib/auth.server';

export async function getUserFromSession(request: Request) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        return session?.user ?? null;
    } catch (error) {
        console.error('Session error:', error);

        return null;
    }
}

export async function requireUser(request: Request) {
    const user = await getUserFromSession(request);

    if (!user) {
        throw new Response('Unauthorized', { status: 401 });
    }

    return user;
}

export async function requireAnonymous(request: Request) {
    const user = await getUserFromSession(request);

    if (user) {
        throw new Response('Already authenticated', {
            status: 302,
            headers: { Location: '/dashboard' },
        });
    }
}
