import { z } from 'zod';
import { type CoreAction, parseBody, parseInput } from './context';

export const REPLY_ACTION = 'core.webhook.reply';

const ReplyStatus = z.coerce.number().int().min(200).max(599);

const ReplyInput = z.object({ status: ReplyStatus.default(200), body: z.json().optional() });

export const Reply = z.object({ status: ReplyStatus, body: z.json().nullable() });

const isTemplate = (value: unknown) => typeof value === 'string' && value.includes('{{');

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
        type: 'number',
        required: false,
        placeholder: '200',
        description: 'From 200 to 599; 200 when empty',
      },
      {
        key: 'body',
        label: 'Body',
        type: 'longtext',
        required: false,
        description: 'JSON, or plain text',
      },
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
