import type { ActionInfo } from '@erxes/core-contract';
import { automations, type Db, plugins, type StoredPluginManifest } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import type { Actor } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { postOutbound } from '~/lib/outbound';
import { signJwt } from '~/lib/signing';
import { addNote } from '~/modules/activities/activities.service';
import { tagCompanies, updateCompany } from '~/modules/companies/companies.service';
import { tagCustomers, updateCustomer } from '~/modules/customers/customers.service';
import { sendEmail } from '~/modules/email/email';
import { notify } from '~/modules/notifications/notifications.service';

/** What an action gets when its step runs. */
export interface ActionContext {
  tx: Db;
  orgId: string;
  /** The member the automation acts as (their permissions apply). */
  actor: Actor;
  automation: { id: string; name: string };
  run: { id: string };
  step: { id: string };
  subject: { type: 'customer' | 'company'; id: string } | null;
  input: Record<string, unknown>;
  /** The run's context (event, subject, earlier outputs), for plugin actions. */
  context: Record<string, unknown>;
}

export interface CoreAction extends Omit<ActionInfo, 'source'> {
  run: (ctx: ActionContext) => Promise<unknown>;
}

const needSubject = (ctx: ActionContext, type: 'customer' | 'company') => {
  if (ctx.subject?.type !== type) {
    throw new HttpError(400, 'NO_SUBJECT', `This step needs a ${type}: the trigger event isn't about one`);
  }

  return ctx.subject.id;
};

const text = (value: unknown) => (value === null || value === undefined ? undefined : String(value));
const list = (value: unknown) => (Array.isArray(value) ? value.map(String) : value ? [String(value)] : []);

/** Only fields an action declares, without empty ones. */
const pick = (input: Record<string, unknown>, keys: string[]) =>
  Object.fromEntries(keys.filter((key) => input[key] !== undefined && input[key] !== null && input[key] !== '').map((key) => [key, input[key]]));

export const CORE_ACTIONS: CoreAction[] = [
  {
    type: 'core.customer.update',
    label: 'Update the customer',
    description: 'Set fields of the customer the event is about',
    subject: 'customer',
    fields: [
      { key: 'firstName', label: 'First name', type: 'text', required: false },
      { key: 'lastName', label: 'Last name', type: 'text', required: false },
      {
        key: 'state',
        label: 'State',
        type: 'select',
        required: false,
        options: [
          { value: 'lead', label: 'Lead' },
          { value: 'customer', label: 'Customer' },
        ],
      },
      { key: 'ownerId', label: 'Owner', type: 'members', required: false },
      { key: 'description', label: 'Description', type: 'longtext', required: false },
    ],
    run: async (ctx) => {
      const id = needSubject(ctx, 'customer');
      const changes = pick(ctx.input, ['firstName', 'lastName', 'state', 'ownerId', 'description']);

      if (Array.isArray(changes.ownerId)) changes.ownerId = changes.ownerId[0];

      const saved = await updateCustomer(ctx.tx, ctx.actor, id, changes as never);

      return { id: saved.id, changed: Object.keys(changes) };
    },
  },
  {
    type: 'core.company.update',
    label: 'Update the company',
    description: 'Set fields of the company the event is about',
    subject: 'company',
    fields: [
      { key: 'primaryName', label: 'Name', type: 'text', required: false },
      { key: 'ownerId', label: 'Owner', type: 'members', required: false },
      { key: 'description', label: 'Description', type: 'longtext', required: false },
    ],
    run: async (ctx) => {
      const id = needSubject(ctx, 'company');
      const changes = pick(ctx.input, ['primaryName', 'ownerId', 'description']);

      if (Array.isArray(changes.ownerId)) changes.ownerId = changes.ownerId[0];

      const saved = await updateCompany(ctx.tx, ctx.actor, id, changes as never);

      return { id: saved.id, changed: Object.keys(changes) };
    },
  },
  {
    type: 'core.customer.tag',
    label: 'Tag the customer',
    description: 'Add or remove tags',
    subject: 'customer',
    fields: [
      { key: 'add', label: 'Add tags', type: 'tags', required: false },
      { key: 'remove', label: 'Remove tags', type: 'tags', required: false },
    ],
    run: async (ctx) => {
      const id = needSubject(ctx, 'customer');

      await tagCustomers(ctx.tx, ctx.actor, { ids: [id], add: list(ctx.input.add), remove: list(ctx.input.remove) });

      return { added: list(ctx.input.add), removed: list(ctx.input.remove) };
    },
  },
  {
    type: 'core.company.tag',
    label: 'Tag the company',
    description: 'Add or remove tags',
    subject: 'company',
    fields: [
      { key: 'add', label: 'Add tags', type: 'tags', required: false },
      { key: 'remove', label: 'Remove tags', type: 'tags', required: false },
    ],
    run: async (ctx) => {
      const id = needSubject(ctx, 'company');

      await tagCompanies(ctx.tx, ctx.actor, { ids: [id], add: list(ctx.input.add), remove: list(ctx.input.remove) });

      return { added: list(ctx.input.add), removed: list(ctx.input.remove) };
    },
  },
  {
    type: 'core.note.add',
    label: 'Add a note',
    description: "Write a note on the customer's or company's timeline",
    subject: 'any',
    fields: [{ key: 'body', label: 'Note', type: 'longtext', required: true }],
    run: async (ctx) => {
      if (!ctx.subject) throw new HttpError(400, 'NO_SUBJECT', "This step needs a customer or company: the trigger event isn't about one");

      const note = await addNote(ctx.tx, ctx.actor, {
        targetType: ctx.subject.type,
        targetId: ctx.subject.id,
        body: text(ctx.input.body) ?? '',
        mentions: [],
        fileIds: [],
      });

      return { noteId: (note as { id?: string }).id ?? null };
    },
  },
  {
    type: 'core.notification.send',
    label: 'Notify team members',
    description: 'Send a notification to members (and the record’s owner)',
    subject: null,
    fields: [
      { key: 'userIds', label: 'Members', type: 'members', required: false },
      { key: 'owner', label: "The record's owner", type: 'boolean', required: false },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'body', label: 'Message', type: 'longtext', required: false },
      { key: 'link', label: 'Link (an erxes path)', type: 'text', required: false },
    ],
    run: async (ctx) => {
      const ownerId = ctx.input.owner === true ? (ctx.context.subject as { ownerId?: string } | null)?.ownerId : undefined;
      const userIds = [...new Set([...list(ctx.input.userIds), ...(ownerId ? [ownerId] : [])])];

      if (!userIds.length) return { sent: 0 };

      const link = text(ctx.input.link);
      const result = await notify(
        ctx.tx,
        { orgId: ctx.orgId, actorType: 'system', actorId: null, source: 'core' } as never,
        {
          userIds,
          kind: 'core.automation.message',
          title: (text(ctx.input.title) ?? '').slice(0, 200) || ctx.automation.name,
          body: text(ctx.input.body)?.slice(0, 2000),
          link: link?.startsWith('/') ? link : undefined,
          entity: ctx.subject ? { type: ctx.subject.type, id: ctx.subject.id } : undefined,
          data: { automationId: ctx.automation.id, runId: ctx.run.id },
        },
      );

      return { sent: result.created };
    },
  },
  {
    type: 'core.webhook.post',
    label: 'Send to a web address',
    description: 'POST JSON to an https address (retried if it fails)',
    subject: null,
    fields: [
      { key: 'url', label: 'Address', type: 'text', required: true },
      { key: 'headers', label: 'Headers (JSON, e.g. {"Authorization": "Bearer …"})', type: 'json', required: false },
      { key: 'body', label: 'JSON body (empty: the event and subject)', type: 'json', required: false },
    ],
    run: async (ctx) => {
      const body = JSON.stringify(
        ctx.input.body ?? { event: ctx.context.event, subject: ctx.context.subject, automation: ctx.automation, run: ctx.run.id },
      );
      const extra = Object.fromEntries(
        Object.entries((ctx.input.headers ?? {}) as Record<string, unknown>)
          .filter(([key]) => /^[A-Za-z0-9-]{1,60}$/.test(key) && !/^(host|content-length|connection|transfer-encoding)$/i.test(key))
          .map(([key, value]) => [key, String(value).slice(0, 2000)]),
      );
      const response = await postOutbound(String(ctx.input.url ?? ''), body, {
        ...extra,
        'Content-Type': 'application/json',
        'User-Agent': 'erxes-automations/1',
        'Idempotency-Key': `${ctx.run.id}:${ctx.step.id}`,
      });

      if (response.status < 200 || response.status >= 300) throw new Error(`HTTP ${response.status}: ${response.body.slice(0, 200)}`);

      let output: unknown = response.body;

      try {
        output = JSON.parse(response.body);
      } catch {
        // Not JSON: keep the text.
      }

      return { status: response.status, body: output };
    },
  },
];


/** More core actions: email, custom fields, round-robin assignment. */
CORE_ACTIONS.push(
  {
    type: 'core.email.send',
    label: 'Send an email',
    description: 'To the customer (their email) or to addresses you give',
    subject: null,
    fields: [
      { key: 'to', label: 'To (subject = the customer; or addresses, comma separated)', type: 'text', required: true },
      { key: 'subject', label: 'Subject', type: 'text', required: true },
      { key: 'body', label: 'Message', type: 'longtext', required: true },
    ],
    run: async (ctx) => {
      const subjectEmail = (ctx.context.subject as { primaryEmail?: string } | null)?.primaryEmail;
      const to = String(ctx.input.to ?? '').trim() === 'subject' ? (subjectEmail ? [subjectEmail] : []) : list(String(ctx.input.to ?? '').split(','));
      const recipients = to.map((address) => address.trim()).filter((address) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)).slice(0, 50);

      if (!recipients.length) return { sent: 0, reason: 'no email address' };

      for (const address of recipients) {
        await sendEmail(ctx.tx, ctx.orgId, {
          to: address,
          template: 'message',
          data: { subject: String(ctx.input.subject ?? '').slice(0, 200), body: String(ctx.input.body ?? '').slice(0, 20_000) },
        });
      }

      return { sent: recipients.length, to: recipients };
    },
  },
  {
    type: 'core.customer.set_field',
    label: 'Set a custom field',
    description: 'Write a value into one of the customer’s custom fields',
    subject: 'customer',
    fields: [
      { key: 'fieldId', label: 'Field id', type: 'text', required: true },
      { key: 'value', label: 'Value (empty clears it)', type: 'text', required: false },
    ],
    run: async (ctx) => {
      const id = needSubject(ctx, 'customer');
      const value = ctx.input.value === '' || ctx.input.value === undefined ? null : ctx.input.value;

      await updateCustomer(ctx.tx, ctx.actor, id, { customFields: { [String(ctx.input.fieldId)]: value } } as never);

      return { fieldId: ctx.input.fieldId, value };
    },
  },
  {
    type: 'core.customer.assign',
    label: 'Assign an owner (round-robin)',
    description: 'Give the customer to the next member in turn',
    subject: 'customer',
    fields: [{ key: 'userIds', label: 'Members to rotate through', type: 'members', required: true }],
    run: async (ctx) => {
      const id = needSubject(ctx, 'customer');
      const members = list(ctx.input.userIds);

      if (!members.length) throw new HttpError(400, 'NO_MEMBERS', 'Choose the members to rotate through');

      // The rotation position lives on the automation (row locked: no two runs pick the same turn).
      const [row] = await ctx.tx
        .select({ state: automations.state })
        .from(automations)
        .where(eq(automations.id, ctx.automation.id))
        .for('update')
        .limit(1);
      const turns = ((row?.state ?? {}) as { turns?: Record<string, number> }).turns ?? {};
      const position = (turns[ctx.step.id] ?? -1) + 1;
      const ownerId = members[position % members.length]!;

      await ctx.tx
        .update(automations)
        .set({ state: sql`jsonb_set(${automations.state}, '{turns}', ${JSON.stringify({ ...turns, [ctx.step.id]: position })}::jsonb)` })
        .where(eq(automations.id, ctx.automation.id));
      await updateCustomer(ctx.tx, ctx.actor, id, { ownerId } as never);

      return { ownerId };
    },
  },
);

export const CORE_CALL_TYP = 'erxes-core-call+jwt';

/**
 * A plugin's action: POST `{ input, context }` to
 * `<api.url>/automations/actions/<type>` with a 5-minute core token (`aud` the
 * plugin) and an `Idempotency-Key` (`<run>:<step>`), so a retry is safe.
 */
export const runPluginAction = async (ctx: ActionContext, plugin: { name: string; manifest: StoredPluginManifest | null }, type: string) => {
  const url = plugin.manifest?.api?.url;

  if (!url) throw new Error(`${plugin.name} has no API address in its manifest`);

  const token = await signJwt(
    { org: ctx.orgId, user: ctx.actor.userId, automation: ctx.automation.id, run: ctx.run.id, step: ctx.step.id },
    { typ: CORE_CALL_TYP, audience: plugin.name, subject: `automation:${ctx.automation.id}`, expiresInSeconds: 300 },
  );
  const response = await postOutbound(
    `${url.replace(/\/+$/, '')}/automations/actions/${type}`,
    JSON.stringify({ input: ctx.input, context: { event: ctx.context.event, subject: ctx.context.subject, steps: ctx.context.steps } }),
    {
      'Content-Type': 'application/json',
      'User-Agent': 'erxes-automations/1',
      Authorization: `Bearer ${token}`,
      'Idempotency-Key': `${ctx.run.id}:${ctx.step.id}`,
    },
    30_000,
  );

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`${plugin.name} answered ${response.status}: ${response.body.slice(0, 300)}`);
  }

  try {
    return JSON.parse(response.body) as unknown;
  } catch {
    return response.body;
  }
};

/** Core's actions and those of the installed plugins (from their manifests). */
export const actionCatalog = (installed: { name: string; manifest: StoredPluginManifest | null }[]): ActionInfo[] => [
  ...CORE_ACTIONS.map(({ run: _run, ...info }) => ({ ...info, source: 'core' })),
  ...installed.flatMap((plugin) =>
    (plugin.manifest?.actions ?? []).map((action) => ({
      type: action.type,
      label: action.label,
      description: action.description ?? null,
      source: plugin.name,
      subject: action.subject ?? null,
      fields: action.fields.map((field) => ({ ...field, type: field.type as ActionInfo['fields'][number]['type'] })),
    })),
  ),
];

export const pluginOfAction = async (client: Db, type: string) => {
  const name = type.split('.')[0]!;
  const [row] = await client.select({ name: plugins.name, manifest: plugins.manifest }).from(plugins).where(eq(plugins.name, name)).limit(1);

  return row ?? null;
};
