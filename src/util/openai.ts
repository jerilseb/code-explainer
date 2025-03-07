import OpenAI from 'openai';
import { Model } from '../types';

export async function getOpenAIExplanation(code: string, apiKey: string, model: Model) {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

    const stream = await openai.chat.completions.create({
        model,
        messages: [
            { role: 'system', content: 'You are a helpful assistant that explains code.' },
            { role: 'user', content: `Explain the following code:\n${code}` }
        ],
        stream: true,
    });
    return stream;
}