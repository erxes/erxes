import {
  collectPlaceholderPaths,
  describeUnresolvedPlaceholders,
  escapeHtml,
  findUnresolvedPlaceholders,
  replacePlaceholders,
  TPlaceholderResolver,
} from 'erxes-api-shared/core-modules';
import { ExpectedError } from 'erxes-api-shared/utils';
import { get } from 'lodash';
import { IModels } from '~/connectionResolvers';
import { buildBrandValues } from '@/notificationTemplates/brand';
import {
  BRAND_FRAME_VARIABLES,
  findTemplateKeyByFile,
  SYSTEM_EMAIL_TEMPLATES,
  SYSTEM_VARIABLES,
  templateFields,
  TSenderData,
  TSystemEmailTemplate,
  TTemplateVariable,
} from '@/notificationTemplates/registry';

export type TTemplateContent = {
  subject?: string;
  preheader?: string;
  content?: string;
  contentJson?: Record<string, unknown>;
};

const MAX_CONTENT_LENGTH = 500_000;

export const validateTemplateContent = (
  definition: TSystemEmailTemplate,
  { subject = '', content = '' }: TTemplateContent,
) => {
  if (!content.trim()) {
    throw new ExpectedError('The email has no content');
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    throw new ExpectedError('The email is too large to send');
  }

  const fields = templateFields(definition);

  const unknown = collectPlaceholderPaths(`${subject} ${content}`).filter(
    (path) => !fields.has(path),
  );

  if (unknown.length) {
    throw new ExpectedError(
      `Unknown fields: ${unknown.map((path) => `{{ ${path} }}`).join(', ')}`,
    );
  }

  const used = new Set(collectPlaceholderPaths(content));

  // the footer carries the postal address and, for notifications, the link
  // to the recipient's settings, so it cannot be left out
  const missing = [
    ...definition.variables.filter(({ required }) => required),
    ...SYSTEM_VARIABLES.filter(({ name }) =>
      BRAND_FRAME_VARIABLES.includes(name),
    ),
  ].filter(({ name }) => !used.has(name));

  if (missing.length) {
    throw new ExpectedError(
      `Required fields missing: ${missing.map(({ label }) => label).join(', ')}`,
    );
  }
};

/**
 * Owns only the fields the template declares. Any other path stays in
 * place, so it reads as unresolved instead of silently becoming empty.
 */
const contractResolver =
  (
    fields: Map<string, TTemplateVariable>,
    values: object,
    escape: boolean,
  ): TPlaceholderResolver =>
  (path) => {
    const field = fields.get(path);

    if (!field) {
      return undefined;
    }

    const value = get(values, path);

    if (value === undefined || value === null || value === '') {
      return null;
    }

    return field.html || !escape ? String(value) : escapeHtml(String(value));
  };

export const renderTemplateContent = async ({
  definition,
  content,
  values,
  markMissing,
}: {
  definition: TSystemEmailTemplate;
  content: TTemplateContent;
  values: object;
  markMissing?: boolean;
}) => {
  const fields = templateFields(definition);

  const html = await replacePlaceholders(
    content.content || '',
    [contractResolver(fields, values, true)],
    { markMissing },
  );

  // the subject is plain text, so its values are not escaped
  const subject = await replacePlaceholders(
    content.subject || definition.defaultSubject,
    [contractResolver(fields, values, false)],
    { markMissing },
  );

  return {
    html,
    subject,
    unresolved: findUnresolvedPlaceholders(`${subject} ${html}`),
  };
};

/**
 * The published template that replaces a built-in file, or null while there
 * is none. A send it cannot fill returns null as well, so the built-in file
 * goes instead: a notification is never lost to its template.
 */
export const loadSystemEmail = async (
  models: IModels,
  subdomain: string,
  file: string,
) => {
  const key = findTemplateKeyByFile(file);

  if (!key) {
    return null;
  }

  const template = await models.NotificationTemplates.findOne(
    { key },
    { published: 1 },
  ).lean();

  const published = template?.published;

  if (!published?.content) {
    return null;
  }

  const definition = SYSTEM_EMAIL_TEMPLATES[key];
  const brand = await buildBrandValues(models, subdomain, {
    manageLink: definition.manageLink,
  });

  const fallBack = async (reason: string) => {
    console.error(`Email template ${key} fell back to the built-in: ${reason}`);

    await models.NotificationTemplates.recordFallback(key, reason).catch(
      (e: Error) => console.error(`Fallback not recorded: ${e.message}`),
    );

    return null;
  };

  return {
    render: async (data: TSenderData) => {
      try {
        const { html, subject, unresolved } = await renderTemplateContent({
          definition,
          content: published,
          values: {
            ...definition.toValues(data),
            brand,
            year: String(new Date().getFullYear()),
          },
        });

        if (unresolved.length) {
          return fallBack(describeUnresolvedPlaceholders(unresolved));
        }

        return { html, subject };
      } catch (e) {
        return fallBack(e.message);
      }
    },
  };
};
