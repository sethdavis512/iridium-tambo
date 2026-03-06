import { getTamboClient } from '~/lib/tambo.server';

export async function createThread(userKey: string) {
    const client = getTamboClient();
    return client.threads.create({ userKey });
}

export async function getAllThreadsByUserKey(userKey: string) {
    const client = getTamboClient();
    const response = await client.threads.list({ userKey });
    return response.threads;
}

export async function getThread(threadId: string, userKey: string) {
    const client = getTamboClient();
    return client.threads.retrieve(threadId, { userKey });
}

export async function deleteThread(threadId: string, userKey: string) {
    const client = getTamboClient();
    await client.threads.delete(threadId, { userKey });
}
