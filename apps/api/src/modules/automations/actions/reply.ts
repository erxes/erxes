import { z } from 'zod';
import { type CoreAction, parseBody, parseInput } from './context';

export const REPLY_ACTION = 'core.webhook.reply';

const ReplyStatus = z.coerce.number().int().min(200).max(599);

const ReplyInput = z.object({ status: ReplyStatus.default(200), body: z.json().optional() });

export const Reply = z.object({ status: ReplyStatus, body: z.json().nullable() });

const isTemplate = (value: unknown) => typeof value === 'string' && value.includes('{{');

const STATUSES = [
  ['200', 'OK'],
  ['201', 'Created'],
  ['202', 'Accepted'],
  ['204', 'No content'],
  ['400', 'Bad request'],
  ['401', 'Not signed in'],
  ['403', 'Not allowed'],
  ['404', 'Not found'],
  ['409', 'Conflict'],
  ['422', 'Can’t process'],
  ['429', 'Too many requests'],
  ['500', 'Server error'],
  ['503', 'Unavailable'],
] as const;

export const REPLY_ACTIONS: CoreAction[] = [
  {
    type: REPLY_ACTION,
    label: 'Reply to the webhook',
    description: 'Answer the request that started the run, with a status and a body',
    subject: null,
    fields: [
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        required: false,
        options: STATUSES.map(([value, label]) => ({ value, label: `${value} · ${label}` })),
        placeholder: '200 · OK',
      },
      { key: 'body', label: 'Body', type: 'json', required: false },
    ],
    outputs: [
      { key: 'status', label: 'Status', type: 'number' },
      { key: 'body', label: 'Body', type: 'text' },
    ],
    check: (input) => {
      const { status } = input;

      if (status === undefined || status === null || status === '' || isTemplate(status)) return [];

      return ReplyStatus.safeParse(status).success ? [] : ['Status is a number from 200 to 599'];
    },
    run: (ctx) => {
      const input = parseInput(ctx, ReplyInput);
      const body = typeof input.body === 'string' ? parseBody(input.body) : input.body;

      return Promise.resolve(Reply.parse({ status: input.status, body: body ?? null }));
    },
  },
];
