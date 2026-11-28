import { db } from '@erxes/core-db';
import { audited, recordOf, scoped } from '~/orpc';
import {
  createEmailTemplate,
  getEmailTemplate,
  listEmailTemplates,
  removeEmailTemplate,
  updateEmailTemplate,
} from './emailTemplates.service';

export const emailTemplatesRouter = {
  list: scoped.emailTemplates.list.handler(({ input }) => listEmailTemplates(db(), input)),
  get: scoped.emailTemplates.get.handler(({ input }) => getEmailTemplate(db(), input.id)),
  create: scoped.emailTemplates.create.handler(({ input }) =>
    audited(
      (tx) => createEmailTemplate(tx, input),
      (template) => recordOf('email_template', 'created', template.id, template),
    ),
  ),
  update: scoped.emailTemplates.update.handler(({ input: { id, ...changes } }) =>
    audited(
      (tx) => updateEmailTemplate(tx, id, changes),
      (template) => ({
        ...recordOf('email_template', 'updated', id, template),
        metadata: { changed: Object.keys(changes) },
      }),
    ),
  ),
  remove: scoped.emailTemplates.remove.handler(({ input }) =>
    audited(
      (tx) => removeEmailTemplate(tx, input.id),
      (removed) => recordOf('email_template', 'deleted', input.id, removed),
    ).then(() => ({ ok: true as const })),
  ),
};
