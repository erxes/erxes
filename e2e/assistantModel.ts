import { z } from 'zod';
import type { ChatRequest, Reply } from '../apps/api/src/__tests__/fakeModel';

export const MODEL_KEY = 'e2e-fake-model-key';

export const MODEL_PORT = Number(process.env.E2E_MODEL_PORT ?? 3510);

const ToolCalls = z.object({
  tool_calls: z.array(
    z.object({ function: z.object({ name: z.string(), arguments: z.string() }) }),
  ),
});

const textOf = (content: ChatRequest['messages'][number]['content']) =>
  typeof content === 'string' ? content : (content ?? []).map((part) => part.text ?? '').join('');

const turnOf = (request: ChatRequest) => {
  const start = request.messages.findLastIndex((message) => message.role === 'user');
  const asked = textOf(request.messages[start]?.content ?? '');

  const calls = request.messages
    .slice(start + 1)
    .flatMap((message) => ToolCalls.safeParse(message).data?.tool_calls ?? [])
    .map((call) => call.function.name);

  return { asked, calls };
};

const addCustomer = (name: string, calls: string[]): Reply =>
  calls.length === 0
    ? {
        reasoning: 'The member wants a new customer, so I will create it.',
        tool: 'callApi',
        input: { procedure: 'customers.create', input: { firstName: name } },
      }
    : { text: `Added ${name} as a customer.` };

const TOP_CUSTOMERS = [
  'Here are the **top 3 customers** by won deal value this quarter:',
  '',
  '| # | Customer | Won deals | Value |',
  '| - | --- | --: | --: |',
  '| 1 | Nomin Trade LLC | 4 | $18,400 |',
  '| 2 | Altai Foods | 3 | $12,950 |',
  '| 3 | Khan Logistics | 2 | $9,700 |',
  '',
  'Nomin Trade leads with `4` won deals.',
].join('\n');

const topCustomers = (calls: string[]): Reply => {
  if (calls.length === 0) {
    return {
      reasoning:
        'The member wants the top customers by won deal value. I will find the customer list procedure first.',
      tool: 'searchApi',
      input: { query: 'customers' },
    };
  }

  if (calls.length === 1) {
    return { tool: 'callApi', input: { procedure: 'customers.list', input: { limit: 3 } } };
  }

  if (calls.length === 2) {
    return { tool: 'callApi', input: { procedure: 'deals.summary', input: {} } };
  }

  return { text: TOP_CUSTOMERS };
};

const welcome = (calls: string[]): Reply =>
  calls.length === 0
    ? {
        tool: 'ask_user',
        input: {
          questions: [
            {
              question: 'Which channel should the welcome message go out on?',
              selectionMode: 'single_select',
              options: [
                { label: 'Email', description: 'From your verified sender' },
                { label: 'SMS' },
                { label: 'Messenger' },
              ],
            },
            { question: 'Anything the message must mention?' },
          ],
        },
      }
    : { text: 'Thanks. I will draft the welcome message for that channel.' };

export const script = (request: ChatRequest): Reply => {
  const { asked, calls } = turnOf(request);
  const name = /^Add a customer named (.+)$/.exec(asked)?.[1];

  if (name) return addCustomer(name, calls);

  if (asked.startsWith('Who are our top')) return topCustomers(calls);

  if (asked.startsWith('Draft a welcome')) return welcome(calls);

  return { text: 'Hello! How can I help?' };
};
