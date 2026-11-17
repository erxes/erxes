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

  const seen = context.join('\n');

  return { asked, calls, records, seen, refs: seen.match(REF) ?? [] };
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

const SALES_REPORT = [
  '<p class="scope">September 2026 · all channels · MNT · 412 orders</p>',
  '<ul class="kpis">',
  '<li class="kpi"><span>Revenue</span><strong>₮118.9M</strong><small class="up">+8% vs Aug</small></li>',
  '<li class="kpi"><span>Orders</span><strong>412</strong><small class="up">+5% vs Aug</small></li>',
  '<li class="kpi"><span>Average order</span><strong>₮288.6K</strong><small class="down">−2% vs Aug</small></li>',
  '</ul>',
  '<ul class="bars">',
  '<li><span>Ulaanbaatar</span><span class="bar" style="width:100%"></span><span>₮84.4M</span></li>',
  '<li><span>Darkhan</span><span class="bar" style="width:25%"></span><span>₮21.1M</span></li>',
  '<li><span>Erdenet</span><span class="bar" style="width:16%"></span><span>₮13.4M</span></li>',
  '</ul>',
  '<table><caption>Orders by city</caption>',
  '<thead><tr><th>City</th><th>Orders</th><th>Revenue</th></tr></thead>',
  '<tbody><tr class="highlight"><td>Ulaanbaatar</td><td>292</td><td>₮84.4M</td></tr>',
  '<tr><td>Darkhan</td><td>73</td><td>₮21.1M</td></tr>',
  '<tr><td>Erdenet</td><td>47</td><td>₮13.4M</td></tr></tbody></table>',
  '<p>Ulaanbaatar brings 71% of revenue; Darkhan grew fastest at +14%.</p>',
].join('\n');

const CITY_TABLE = [
  'City,Orders,Revenue (MNT)',
  'Ulaanbaatar,292,84400000',
  'Darkhan,73,21100000',
  'Erdenet,47,13400000',
].join('\n');

const MEETING_NOTES = [
  '# Weekly sales meeting',
  '',
  '**Date:** 12 November 2026 · **Attendees:** Nomin, Bat-Erdene, Saraa',
  '',
  '## Decisions',
  '',
  '1. Launch the winter bundle in Darkhan on 1 December.',
  '2. Move the Erdenet follow-ups to the new pipeline.',
  '',
  '## Next steps',
  '',
  '| Owner | Task | Due |',
  '| --- | --- | --- |',
  '| Nomin | Price the winter bundle | 20 Nov |',
  '| Saraa | Call the five largest Erdenet accounts | 22 Nov |',
].join('\n');

const deliver = (
  { calls }: Turn,
  artifact: { format: string; title: string; content: string },
): Reply =>
  calls.length === 0
    ? { tool: 'createArtifact', input: artifact }
    : { text: `${artifact.title} is ready.` };

const ATTACHED = /\[Attachment\] "([^"]+)"/;

const BETWEEN_MARKERS = /<<<\n([\s\S]*?)\n>>>/;

const readAttached = ({ seen }: Turn): Reply => {
  const name = ATTACHED.exec(seen)?.[1];
  const firstLine = BETWEEN_MARKERS.exec(seen)?.[1]?.split('\n')[0];

  return {
    text: name
      ? `I read **${name}**. Its first line is: ${firstLine ?? 'an image'}.`
      : 'I do not see an attachment.',
  };
};

const Selected = z.object({ title: z.string(), path: z.string(), visibleText: z.string() });

const SELECTION = /\[Page selection\][^{]*(\{.*\})/;

const selectedOf = (seen: string) => {
  try {
    return Selected.safeParse(JSON.parse(SELECTION.exec(seen)?.[1] ?? '')).data;
  } catch {
    return undefined;
  }
};

const explainSelection = ({ seen }: Turn): Reply => {
  const selected = selectedOf(seen);

  if (!selected) return { text: 'I do not see a selection.' };

  const lines = selected.visibleText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);

  return {
    text: [
      `You selected **${selected.title}** on \`${selected.path}\`. It starts with:`,
      '',
      ...lines.map((line) => `- ${line}`),
    ].join('\n'),
  };
};

const automationPlan = ({ calls }: Turn): Reply => {
  if (calls.length === 0) return { tool: 'loadSkill', input: { name: 'author-automation' } };

  if (calls.length === 1) return { tool: 'searchApi', input: { query: 'automation triggers' } };

  return {
    text: [
      'Here is the draft I will save. It stays off until you turn it on in Automations:',
      '',
      '- **Name:** Tag website leads',
      '- **When:** a lead is created with source *Website*',
      '- **Then:** add the tag `website` and assign the lead to the sales team',
      '',
      'Shall I create the draft?',
    ].join('\n'),
  };
};

const NAMED = /^Add a customer named (.+)$/;

export const script = (request: ChatRequest): Reply => {
  const turn = turnOf(request);
  const name = NAMED.exec(turn.asked)?.[1];

  if (name) return addCustomer(name, turn);

  if (turn.asked.startsWith('Who are our top')) return topCustomers(turn);

  if (turn.asked.startsWith('Draft a welcome')) return welcome(turn);

  if (turn.asked.startsWith('Set up an automation')) return automationPlan(turn);

  if (turn.asked.startsWith('Make a sales report'))
    return deliver(turn, {
      format: 'html',
      title: 'September sales report',
      content: SALES_REPORT,
    });

  if (turn.asked.startsWith('Export orders by city'))
    return deliver(turn, { format: 'csv', title: 'Orders by city', content: CITY_TABLE });

  if (turn.asked.startsWith('Write the meeting notes'))
    return deliver(turn, {
      format: 'markdown',
      title: 'Weekly sales meeting',
      content: MEETING_NOTES,
    });

  if (turn.asked.startsWith('What is in the file')) return readAttached(turn);

  if (turn.asked.startsWith('Explain what I selected')) return explainSelection(turn);

  if (turn.asked.startsWith('Say goodbye')) return { text: 'Goodbye! Talk soon.' };

  if (turn.refs.length && (turn.asked.includes('@') || turn.asked.includes('this')))
    return aboutRecords([...new Set(turn.refs)]);

  return { text: 'Hello! How can I help?' };
};

export const titles: Titles = (prompt) => {
  const name = NAMED.exec(prompt)?.[1];

  if (name) return `New customer ${name}`;

  if (prompt.startsWith('Who are our top')) return 'Top customers this quarter';

  if (prompt.startsWith('Draft a welcome')) return 'Welcome message for new customers';

  if (prompt.startsWith('Set up an automation')) return 'Tag website leads';

  if (prompt.startsWith('Hello there')) return 'Greeting';

  if (prompt.startsWith('Make a sales report')) return 'September sales report';

  if (prompt.startsWith('Export orders by city')) return 'Orders by city';

  if (prompt.startsWith('What is in the file')) return 'Reading an attached file';

  if (prompt.startsWith('Write the meeting notes')) return 'Weekly sales meeting notes';

  if (prompt.startsWith('Explain what I selected')) return 'About the selected table';

  return firstWords(prompt.replaceAll('@', ''));
};
