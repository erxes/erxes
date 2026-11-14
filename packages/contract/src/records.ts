import { ASSISTANT_RECORD_TYPES } from '@erxes/core-db/enums';
import { z } from 'zod';
import { Id } from './common';

export const AssistantRecordType = z.enum(ASSISTANT_RECORD_TYPES);

export type AssistantRecordType = z.infer<typeof AssistantRecordType>;

export const RECORD_IDS = z.registry<{ record: AssistantRecordType }>();

const recordId = (record: AssistantRecordType) => Id.clone().register(RECORD_IDS, { record });

export const CustomerId = recordId('customer');

export const CompanyId = recordId('company');

export const MemberId = recordId('member');

export const ProductId = recordId('product');

export const AutomationId = recordId('automation');

export const RECORD_LABEL_MAX = 80;

export const cleanRecordLabel = (text: string) =>
  text.replace(/[[\]]/g, '').replace(/\s+/g, ' ').trim().slice(0, RECORD_LABEL_MAX).trim();

const LABEL_FIELDS: Record<AssistantRecordType, (string | string[])[]> = {
  customer: [['firstName', 'lastName'], 'primaryEmail', 'primaryPhone', 'code'],
  company: ['primaryName', 'primaryEmail', 'code'],
  member: ['fullName', 'username', 'email'],
  product: ['name', 'code'],
  automation: ['name'],
};

const Row = z.record(z.string(), z.unknown());

const textOf = (row: Record<string, unknown>, field: string | string[]) =>
  (typeof field === 'string' ? [field] : field)
    .map((name) => row[name])
    .filter((value): value is string => typeof value === 'string')
    .join(' ');

export const recordLabel = (type: AssistantRecordType, value: unknown) => {
  const row = Row.safeParse(value).data ?? {};

  for (const field of LABEL_FIELDS[type]) {
    const label = cleanRecordLabel(textOf(row, field));

    if (label) return label;
  }

  return null;
};

export const RecordLabel = z
  .string()
  .trim()
  .min(1)
  .max(RECORD_LABEL_MAX)
  .regex(/^[^[\]\r\n]+$/, 'a name without brackets or line breaks');

export const ReferenceHandle = z.string().regex(/^[\w-]{1,64}$/);

export const ASSISTANT_MENTION_MAX = 10;

export const AssistantMention = z.object({
  type: AssistantRecordType,
  id: Id,
  label: RecordLabel,
  ref: ReferenceHandle.optional(),
});

export type AssistantMention = z.infer<typeof AssistantMention>;

export const AssistantMentions = z.object({
  mentions: z
    .array(AssistantMention)
    .min(1)
    .max(ASSISTANT_MENTION_MAX)
    .refine(
      (mentions) =>
        new Set(mentions.map(({ type, id }) => `${type}:${id}`)).size === mentions.length,
      'each record is mentioned once',
    ),
});

export type AssistantMentions = z.infer<typeof AssistantMentions>;

export const AssistantPagePath = z
  .string()
  .max(200)
  .regex(/^\/(?!\/)[\w\-./~%]*$/, 'a path inside the app, such as /contacts/customers');

export const AssistantPage = z.object({
  path: AssistantPagePath,
  record: z
    .object({
      type: AssistantRecordType,
      id: Id,
      label: RecordLabel.optional(),
      ref: ReferenceHandle.optional(),
    })
    .optional(),
});

export type AssistantPage = z.infer<typeof AssistantPage>;

export const REFERENCE_PATTERN = /\[\[ref:([\w-]{1,64})\]\]/g;

export const referenceToken = (handle: string) => `[[ref:${handle}]]`;
