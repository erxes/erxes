import { z } from 'zod';
import {
  type ChatRequest,
  firstWords,
  type Reply,
  type Titles,
} from '../apps/api/src/__tests__/fakeModel';

export const MODEL_KEY = 'e2e-fake-model-key';

export const MODEL_PORT = Number(process.env.E2E_MODEL_PORT ?? 3510);

const ToolCalls = z.object({
  tool_calls: z.array(
    z.object({ function: z.object({ name: z.string(), arguments: z.string() }) }),
  ),
});

const References = z.object({
  references: z.array(z.object({ ref: z.string(), label: z.string() })).default([]),
});

const REF = /\[\[ref:[\w-]+\]\]/g;

const textsOf = (content: ChatRequest['messages'][number]['content']) =>
  typeof content === 'string' ? [content] : (content ?? []).map((part) => part.text ?? '');

const referencesIn = (text: string) => {
  try {
    return References.safeParse(JSON.parse(text)).data?.references ?? [];
  } catch {
    return [];
  }
};

const turnOf = (request: ChatRequest) => {
  const start = request.messages.findLastIndex((message) => message.role === 'user');
  const [asked = '', ...context] = textsOf(request.messages[start]?.content ?? null);
  const after = request.messages.slice(start + 1);

  const calls = after
    .flatMap((message) => ToolCalls.safeParse(message).data?.tool_calls ?? [])
    .map((call) => call.function.name);

  const records = after
    .filter((message) => message.role === 'tool')
    .flatMap((message) => textsOf(message.content).flatMap(referencesIn));

  return { asked, calls, records, refs: context.join('\n').match(REF) ?? [] };
};

type Turn = ReturnType<typeof turnOf>;

const addCustomer = (name: string, { calls }: Turn): Reply =>
  calls.length === 0
    ? {
        reasoning: 'The member wants a new customer, so I will create it.',
        tool: 'callApi',
        input: { procedure: 'customers.create', input: { firstName: name } },
      }
    : { text: `Added ${name} as a customer.` };

const DEALS = [
  { won: 4, value: '$18,400' },
  { won: 3, value: '$12,950' },
  { won: 2, value: '$9,700' },
];

const topCustomersTable = (records: Turn['records']) => {
  const rows = records
    .slice(0, DEALS.length)
    .map(
      (record, index) =>
        `| ${index + 1} | ${record.ref} | ${DEALS[index]?.won} | ${DEALS[index]?.value} |`,
    );

  return [
    `Here are the **top ${rows.length} customers** by won deal value this quarter:`,
    '',
    '| # | Customer | Won deals | Value |',
    '| - | --- | --: | --: |',
    ...rows,
    '',
    `${records[0]?.ref ?? 'The first customer'} leads with \`4\` won deals.`,
  ].join('\n');
};

const topCustomers = ({ calls, records }: Turn): Reply => {
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

  return { text: topCustomersTable(records) };
};

const welcome = ({ calls }: Turn): Reply =>
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

const aboutRecords = (refs: string[]): Reply => ({
  text: [
    `Here is what I know about ${refs.join(' and ')}:`,
    '',
    '- Added to the workspace this month',
    '- No open deals yet',
    '- Last contacted by email',
  ].join('\n'),
});

const NAMED = /^Add a customer named (.+)$/;

export const script = (request: ChatRequest): Reply => {
  const turn = turnOf(request);
  const name = NAMED.exec(turn.asked)?.[1];

  if (name) return addCustomer(name, turn);

  if (turn.asked.startsWith('Who are our top')) return topCustomers(turn);

  if (turn.asked.startsWith('Draft a welcome')) return welcome(turn);

  if (turn.refs.length && (turn.asked.includes('@') || turn.asked.includes('this')))
    return aboutRecords([...new Set(turn.refs)]);

  return { text: 'Hello! How can I help?' };
};

export const titles: Titles = (prompt) => {
  const name = NAMED.exec(prompt)?.[1];

  if (name) return `New customer ${name}`;

  if (prompt.startsWith('Who are our top')) return 'Top customers this quarter';

  if (prompt.startsWith('Draft a welcome')) return 'Welcome message for new customers';

  if (prompt.startsWith('Hello there')) return 'Greeting';

  return firstWords(prompt.replaceAll('@', ''));
};
