import { IContext } from '~/connectionResolvers';
import { getEmailBrand } from '@/notificationTemplates/brand';
import { SYSTEM_EMAIL_TEMPLATES } from '@/notificationTemplates/registry';
import { TTemplateContent } from '@/notificationTemplates/render';
import {
  renderSample,
  toTemplateView,
} from '@/notificationTemplates/graphql/resolvers/utils';

const PERMISSION = 'notificationTemplatesManage';

export const notificationTemplateQueries = {
  // every editable template, customized or not
  async notificationTemplates(
    _root: undefined,
    _args: undefined,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission(PERMISSION);

    const keys = Object.keys(SYSTEM_EMAIL_TEMPLATES);
    const templates = await models.NotificationTemplates.find({
      key: { $in: keys },
    });

    return keys.map((key) =>
      toTemplateView(
        key,
        templates.find((template) => template.key === key),
      ),
    );
  },

  async notificationTemplateDetail(
    _root: undefined,
    { key }: { key: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission(PERMISSION);

    return toTemplateView(
      key,
      await models.NotificationTemplates.findOne({ key }),
    );
  },

  // the sample values make an empty field show its own name, never a gap
  async notificationTemplatePreview(
    _root: undefined,
    { key, input }: { key: string; input: TTemplateContent },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission(PERMISSION);

    return renderSample(models, subdomain, key, input, { markMissing: true });
  },

  async notificationEmailBrand(
    _root: undefined,
    _args: undefined,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission(PERMISSION);

    return getEmailBrand(models);
  },
};
