import OpenAI from 'openai';

export async function POST(req) {

    const {}

    const openai = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPEN-ROUTER_API_KEY,
    });
}