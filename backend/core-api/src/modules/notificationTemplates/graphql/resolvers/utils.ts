import { IModels } from '~/connectionResolvers';
import { buildBrandValues } from '@/notificationTemplates/brand';
import { INotificationTemplateDocument } from '@/notificationTemplates/db/definitions/notificationTemplates';
import {
  getSystemEmailTemplate,
  templateSampleValues,
} from '@/notificationTemplates/registry';
import {
  renderTemplateContent,
  TTemplateContent,
} from '@/notificationTemplates/render';

/** What the registry says about a template, with what the workspace saved. */
export const toTemplateView = (
  key: string,
  template?: INotificationTemplateDocument | null,
) => {
  const { title, description, defaultSubject, variables, starterJson } =
    getSystemEmailTemplate(key);

  return {
    key,
    title,
    description,
    defaultSubject,
    variables,
    starterJson,
    draft: template?.draft,
    published: template?.published,
    draftRevision: template?.draftRevision ?? 0,
    publishedRevision: template?.publishedRevision,
    version: template?.version ?? 0,
    fallbackCount: template?.fallbackCount ?? 0,
    lastFallbackAt: template?.lastFallbackAt,
    lastFallbackReason: template?.lastFallbackReason,
  };
};

/** The template filled with its sample values and the current brand. */
export const renderSample = async (
  models: IModels,
  subdomain: string,
  key: string,
  content: TTemplateContent,
  { markMissing }: { markMissing: boolean },
) => {
  const definition = getSystemEmailTemplate(key);

  return renderTemplateContent({
    definition,
    content,
    values: {
      ...templateSampleValues(definition),
      brand: await buildBrandValues(models, subdomain, {
        manageLink: definition.manageLink,
      }),
      year: String(new Date().getFullYear()),
    },
    markMissing,
  });
};
