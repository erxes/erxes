import { z } from 'zod';
import { systemCaller } from '~/http/auth';
import { postOutbound } from '~/lib/outbound';
import { sendEmail } from '~/modules/email/email';
import { notify } from '~/modules/notifications/notifications.service';
import { type CoreAction, idempotencyKey, list, parseBody, subjectFields, text } from './context';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Headers a member may add to a webhook: plain names, not ones the transport owns. */
const extraHeaders = (value: unknown) =>
  Object.fromEntries(
    Object.entries(z.record(z.string(), z.unknown()).catch({}).parse(value))
      .filter(
        ([key]) =>
          /^[A-Za-z0-9-]{1,60}$/.test(key) &&
          !/^(host|content-length|connection|transfer-encoding)$/i.test(key),
      )
      .map(([key, item]) => [key, (text(item) ?? '').slice(0, 2000)]),
  );

/** Actions that tell people or other systems. */
export const MESSAGE_ACTIONS: CoreAction[] = [
  {
    type: 'core.notification.send',
    label: 'Notify team members',
    description: 'Send a notification to members (and the record’s owner)',
    subject: null,
    fields: [
      { key: 'userIds', label: 'Members', type: 'members', required: false },
      { key: 'owner', label: "Also the record's owner", type: 'boolean', required: false },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'body', label: 'Message', type: 'longtext', required: false },
      {
        key: 'link',
        label: 'Link',
        type: 'text',
        required: false,
        placeholder: '/contacts/customers',
        description: 'A page in erxes the notification opens',
      },
    ],
    run: async (ctx) => {
      const ownerId = ctx.input.owner === true ? subjectFields(ctx)?.ownerId : null;
      const userIds = [...new Set([...list(ctx.input.userIds), ...(ownerId ? [ownerId] : [])])];

      if (!userIds.length) return { sent: 0 };

      const link = text(ctx.input.link);

      const result = await notify(ctx.tx, systemCaller(ctx.orgId), {
        userIds,
        kind: 'core.automation.message',
        title: (text(ctx.input.title) ?? '').slice(0, 200) || ctx.automation.name,
        body: text(ctx.input.body)?.slice(0, 2000),
        link: link?.startsWith('/') ? link : undefined,
        entity: ctx.subject ?? undefined,
        data: { automationId: ctx.automation.id, runId: ctx.run.id },
      });

      return { sent: result.created };
    },
  },
  {
    type: 'core.email.send',
    label: 'Send an email',
    description: 'To the customer (their email) or to addresses you give',
    subject: null,
    fields: [
      { key: 'to', label: 'To', type: 'recipients', required: true },
      {
        key: 'subject',
        label: 'Subject',
        type: 'text',
        required: true,
        placeholder: 'Welcome, {{subject.firstName}}',
      },
      { key: 'body', label: 'Message', type: 'longtext', required: true },
    ],
    // Queues the emails in the step's transaction; the email job sends them.
    run: async (ctx) => {
      const to = (text(ctx.input.to) ?? '').trim();
      const subjectEmail = subjectFields(ctx)?.primaryEmail;
      const addresses = to === 'subject' ? [subjectEmail ?? ''] : to.split(',');

      const recipients = addresses
        .map((address) => address.trim())
        .filter((address) => EMAIL.test(address))
        .slice(0, 50);

      if (!recipients.length) return { sent: 0, reason: 'no email address' };

      for (const address of recipients) {
        await sendEmail(ctx.tx, ctx.orgId, {
          to: address,
          template: 'message',
          data: {
            subject: (text(ctx.input.subject) ?? '').slice(0, 200),
            body: (text(ctx.input.body) ?? '').slice(0, 20_000),
          },
        });
      }

      return { sent: recipients.length, to: recipients };
    },
  },
  {
    type: 'core.webhook.post',
    label: 'Send to a web address',
    description: 'POST JSON to an https address (retried if it fails)',
    subject: null,
    fields: [
      {
        key: 'url',
        label: 'Address',
        type: 'text',
        required: true,
        placeholder: 'https://example.com/hooks/erxes',
      },
      {
        key: 'headers',
        label: 'Headers',
        type: 'json',
        required: false,
        placeholder: '{ "Authorization": "Bearer …" }',
      },
      {
        key: 'body',
        label: 'Body',
        type: 'json',
        required: false,
        description: 'JSON; leave empty to send the event and the record',
      },
    ],
    call: async (ctx) => {
      const body = JSON.stringify(
        ctx.input.body ?? {
          event: ctx.context.event,
          subject: ctx.context.subject,
          automation: ctx.automation,
          run: ctx.run.id,
        },
      );

      const response = await postOutbound(text(ctx.input.url) ?? '', body, {
        ...extraHeaders(ctx.input.headers),
        'Content-Type': 'application/json',
        'User-Agent': 'erxes-automations/1',
        'Idempotency-Key': idempotencyKey(ctx),
      });

      if (response.status < 200 || response.status >= 300)
        throw new Error(`HTTP ${response.status}: ${response.body.slice(0, 200)}`);

      return { status: response.status, body: parseBody(response.body) };
    },
  },
];
