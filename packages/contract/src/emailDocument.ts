import { EMAIL_MARK_TYPES, EMAIL_NODE_TYPES } from '@erxes/core-db/emailEnums';
import type { EmailNode } from '@erxes/core-db/schema';
import { z } from 'zod';
import { CORE_API_PREFIX } from './values';

/** Where a link may go: the web, mail or a call. */
const LINK = /^(https?:\/\/|mailto:|tel:)/i;

/** Where a picture may come from: the web, or a public file of core's (made a full address when sent). */
const PICTURE = new RegExp(`^(https?://|${CORE_API_PREFIX}/files/public/)`, 'i');

/** Attributes holding a link, and those holding a picture's address. */
const LINK_ATTRS = ['href', 'url', 'externalLink', 'link'];
const PICTURE_ATTRS = ['src', 'image'];

/** The largest document, as JSON: far above any email, far below the request limit. */
const MAX_DOCUMENT = 200_000;

const Attrs = z.record(z.string().max(64), z.json());

/** A blank address, or one with an allowed scheme; a placeholder may follow the scheme. */
const isAllowed = (value: unknown, pattern: RegExp) =>
  value === null ||
  value === undefined ||
  value === '' ||
  (typeof value === 'string' && pattern.test(value.trim()));

/** Links and pictures by scheme, a placeholder's name and fallback, and no rules shown per recipient. */
const checkAttrs = (type: string, attrs: z.infer<typeof Attrs>, ctx: z.RefinementCtx) => {
  const refuse = (key: string, message: string) =>
    ctx.addIssue({ code: 'custom', path: ['attrs', key], message });

  for (const key of LINK_ATTRS) {
    if (!isAllowed(attrs[key], LINK)) refuse(key, 'a web, mailto: or tel: link');
  }

  for (const key of PICTURE_ATTRS) {
    if (!isAllowed(attrs[key], PICTURE)) refuse(key, 'an http(s) address');
  }

  if (attrs.visibilityRule !== undefined && attrs.visibilityRule !== null) {
    refuse('visibilityRule', 'shown to every recipient: conditions are not supported');
  }

  if (type !== 'variable') return;

  if (typeof attrs.id !== 'string' || !/^[A-Za-z]+$/.test(attrs.id)) {
    refuse('id', 'a field name in letters');
  }

  const { fallback } = attrs;

  if (
    fallback !== undefined &&
    fallback !== null &&
    (typeof fallback !== 'string' || /[{}|]/.test(fallback) || fallback.length > 100)
  ) {
    refuse('fallback', 'up to 100 characters, without { } or |');
  }
};

const EmailMark = z
  .object({ type: z.enum(EMAIL_MARK_TYPES), attrs: Attrs.optional() })
  .superRefine(({ type, attrs }, ctx) => attrs && checkAttrs(type, attrs, ctx));

/**
 * A node of the email editor's document (maily JSON). Raw HTML and repeated blocks are
 * refused, links are web, mail or phone only, pictures web only.
 */
const EmailNodeSchema: z.ZodType<EmailNode> = z.lazy(() =>
  z
    .object({
      type: z.enum(EMAIL_NODE_TYPES),
      attrs: Attrs.optional(),
      content: z.array(EmailNodeSchema).max(1000).optional(),
      marks: z.array(EmailMark).max(20).optional(),
      text: z.string().max(20_000).optional(),
    })
    .superRefine(({ type, attrs }, ctx) => attrs && checkAttrs(type, attrs, ctx)),
);

/** An email's message as the email editor writes it: a `doc` node, up to 200 KB as JSON. */
export const EmailDocument = EmailNodeSchema.refine((node) => node.type === 'doc', {
  message: 'a doc node',
  path: ['type'],
}).refine((node) => JSON.stringify(node).length <= MAX_DOCUMENT, 'at most 200 KB');
