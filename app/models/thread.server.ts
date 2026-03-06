import { getTamboClient } from '~/lib/tambo.server';

export async function deleteThread(threadId: string, userKey: string) {
    const client = getTamboClient();
    await client.threads.delete(threadId, { userKey });
}
