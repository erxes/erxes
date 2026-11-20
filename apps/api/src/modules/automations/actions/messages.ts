import { runAs, system } from '@erxes/core-db';
import { z } from 'zod';
import { postOutbound } from '~/lib/outbound';
import { sendEmail } from '~/modules/email/email';
import { suppressedOf } from '~/modules/email/addresses';
import { requireReplyTo } from '~/modules/email/replyTos.service';
import { requireDelivery } from '~/modules/email/sender';
import { notify } from '~/modules/notifications/notifications.service';
import {
  checked,
  type CoreAction,
  idempotencyKey,
  list,
  parseBody,
  subjectFields,
  text,
} from './context';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** An email step's Cc: up to 5 addresses, copied on each of its emails. */
const CcList = z
  .array(z.email('an address in Cc is not an email address'))
  .max(5, 'Cc takes at most 5 addresses');

const ccOf = (value: unknown) => [
  ...new Set(
    (text(value) ?? '')
      .split(',')
      .map((address) => address.trim().toLowerCase())
      .filter(Boolean),
  ),
];

/** Headers a member may add to a webhook: plain names, not ones the transport owns. */
const extraHeaders = (value: unknown) =>
  Object.fromEntries(
    Object.entries(z.record(z.string(), z.unknown()).safeParse(value).data ?? {})
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

      // The automation's message, not the member's: they hear it too.
      const result = await runAs(system('automation message'), () =>
        notify(ctx.tx, {
          userIds,
          kind: 'core.automation.message',
          title: (text(ctx.input.title) ?? '').slice(0, 200) || ctx.automation.name,
          body: text(ctx.input.body)?.slice(0, 2000),
          link: link?.startsWith('/') ? link : undefined,
          entityType: ctx.subject?.type,
          entityId: ctx.subject?.id,
          data: { automationId: ctx.automation.id, runId: ctx.run.id },
        }),
      );

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
      {
        key: 'cc',
        label: 'Cc',
        type: 'text',
        required: false,
        placeholder: 'manager@acme.mn, sales@acme.mn',
        description: 'Up to 5 addresses, comma separated, copied on each email',
      },
      {
        key: 'fromName',
        label: 'Sender label',
        type: 'text',
        required: false,
        placeholder: 'Support',
        description: 'Shown with the organisation’s name, e.g. “MSM Group · Support”',
      },
      {
        key: 'replyTo',
        label: 'Replies go to',
        type: 'reply_to',
        required: false,
        description: 'One of the verified addresses in Settings › Email sending',
      },
    ],
    outputs: [
      { key: 'sent', label: 'Emails sent', type: 'number' },
      { key: 'held', label: 'Emails held by the sending limit', type: 'number' },
      { key: 'suppressed', label: 'Addresses suppressed', type: 'number' },
    ],
    // Placeholders fill in when the step runs, and are checked then.
    check: (input) => {
      const cc = text(input.cc) ?? '';

      if (cc.includes('{{')) return [];

      return [
        ...new Set(CcList.safeParse(ccOf(cc)).error?.issues.map((issue) => issue.message)),
      ];
    },
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

      const data = {
        subject: (text(ctx.input.subject) ?? '').slice(0, 200),
        body: (text(ctx.input.body) ?? '').slice(0, 20_000),
      };

      const fromName = text(ctx.input.fromName)?.trim() || undefined;
      const replyTo = text(ctx.input.replyTo)?.trim().toLowerCase() || undefined;

      // Email that can't be delivered, or a Reply-To that isn't verified (any more), fails the step.
      await requireDelivery(ctx.tx);
      await requireReplyTo(ctx.tx, replyTo, ['replyTo']);

      // A Cc that is also a recipient, or suppressed, is left out.
      const wanted = checked(CcList, ccOf(ctx.input.cc)).filter(
        (address) => !recipients.some((recipient) => recipient.toLowerCase() === address),
      );
      const suppressedCc = await suppressedOf(ctx.tx, wanted, false);
      const cc = wanted.filter((address) => !suppressedCc.has(address));

      // To the customer the run is about: the email shows on their timeline.
      const customerId =
        to === 'subject' && ctx.subject?.type === 'customer' ? ctx.subject.id : null;

      // A suppressed address (bounced, complained, added by a member) is held back, and the
      // sending ramp may hold some until its next window: the outcome says so.
      const { queued, held, suppressed } = await sendEmail(
        ctx.tx,
        ctx.orgId,
        recipients.map((address) => ({
          customerId,
          to: address,
          template: 'message',
          fromName,
          replyTo,
          cc: cc.length ? cc : undefined,
          data,
        })),
        { source: 'automation', sourceId: ctx.automation.id },
      );

      const reasons = [
        suppressed ? `${suppressed} of ${recipients.length} addresses are suppressed` : null,
        held
          ? `${held} of ${recipients.length} are held by the sending limit and go out when it allows`
          : null,
      ].filter(Boolean);

      return {
        sent: queued,
        held,
        suppressed,
        to: recipients,
        ...(cc.length ? { cc } : {}),
        ...(reasons.length ? { reason: reasons.join('; ') } : {}),
      };
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
    outputs: [
      { key: 'status', label: 'Response status', type: 'number' },
      { key: 'body', label: 'Response', type: 'text' },
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
