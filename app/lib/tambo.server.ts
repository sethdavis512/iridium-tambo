import TamboAI from '@tambo-ai/typescript-sdk';

let client: TamboAI | null = null;

export function getTamboClient(): TamboAI {
    if (!client) {
        client = new TamboAI({
            apiKey: process.env.TAMBO_API_KEY,
        });
    }
    return client;
}
