import { emailTemplates } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema, createUpdateSchema } from 'drizzle-zod';
import { z } from 'zod';
import { cursorPageOf, CursorQuery, Id, isoDate } from './common';
import { EmailDocument } from './emailDocument';
import { COMMON_ERRORS } from './errors';

/** A message saved to start emails from: the email editor's document and a name. */
export const EmailTemplate = createSelectSchema(emailTemplates, {
  id: Id,
  content: () => EmailDocument,
  createdAt: isoDate,
  updatedAt: isoDate,
}).pick({
  id: true,
  /** Unique in the organisation, whatever the case. */
  name: true,
  /** The message as the email editor's document (maily JSON, a `doc` node). */
  content: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export type EmailTemplate = z.infer<typeof EmailTemplate>;

/** A template in a list: its document is read when it is used (`get`). */
export const EmailTemplateItem = EmailTemplate.omit({ content: true });

export type EmailTemplateItem = z.infer<typeof EmailTemplateItem>;

const EmailTemplateFields = createUpdateSchema(emailTemplates, {
  name: (name) => name.trim().min(1).max(100),
  content: () => EmailDocument,
}).pick({ name: true, content: true });

const ById = z.object({ id: Id });

const base = oc.errors(COMMON_ERRORS);

/**
 * Messages saved to start emails from (`broadcasts.view` reads, `broadcasts.manage`
 * writes). Using one copies its document, so a change or a delete never reaches an
 * email made with it. Self-hosted only: on SaaS each answers 402 NOT_IN_PLAN.
 */
export const emailTemplatesContract = {
  list: base
    .route({
      method: 'GET',
      path: '/email-templates',
      summary: 'List email templates',
      description: 'Newest first, without their documents; `search` matches the name',
    })
    .input(CursorQuery.extend({ search: z.string().trim().max(100).optional() }))
    .output(cursorPageOf(EmailTemplateItem)),
  get: base
    .route({
      method: 'GET',
      path: '/email-templates/{id}',
      summary: 'Get an email template',
      description: 'One email template with its content',
    })
    .input(ById)
    .output(EmailTemplate),
  create: base
    .route({
      method: 'POST',
      path: '/email-templates',
      successStatus: 201,
      summary: 'Create an email template',
      description: '409 TAKEN when another template has the name',
    })
    .input(EmailTemplateFields.required({ name: true, content: true }))
    .output(EmailTemplate),
  update: base
    .route({
      method: 'PATCH',
      path: '/email-templates/{id}',
      summary: 'Change an email template',
      description:
        '409 TAKEN when another template has the name. Emails made with it keep their message',
    })
    .input(
      EmailTemplateFields.extend({ id: Id }).refine(
        (value) => Object.keys(value).some((key) => key !== 'id'),
        'nothing to update',
      ),
    )
    .output(EmailTemplate),
  remove: base
    .route({
      method: 'DELETE',
      path: '/email-templates/{id}',
      summary: 'Delete an email template',
      description: 'Emails made with it keep their message',
    })
    .input(ById)
    .output(z.object({ ok: z.literal(true) })),
};
