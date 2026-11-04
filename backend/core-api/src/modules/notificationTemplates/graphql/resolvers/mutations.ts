import { describeUnresolvedPlaceholders } from 'erxes-api-shared/core-modules';
import { ExpectedError } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { sendEmail } from '~/utils/email';
import {
  TEmailBrand,
  updateEmailBrand,
} from '@/notificationTemplates/brand';
import { getSystemEmailTemplate } from '@/notificationTemplates/registry';
import {
  TTemplateContent,
  validateTemplateContent,
} from '@/notificationTemplates/render';
import {
  renderSample,
  toTemplateView,
} from '@/notificationTemplates/graphql/resolvers/utils';

const PERMISSION = 'notificationTemplatesManage';

type TTemplateArgs = {
  key: string;
  draftRevision: number;
  input: TTemplateContent;
};

export const notificationTemplateMutations = {
  async notificationTemplateSaveDraft(
    _root: undefined,
    { key, draftRevision, input }: TTemplateArgs,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission(PERMISSION);

    return toTemplateView(
      key,
      await models.NotificationTemplates.saveDraft(
        key,
        input,
        user._id,
        draftRevision,
      ),
    );
  },

  async notificationTemplatePublish(
    _root: undefined,
    { key, draftRevision, input }: TTemplateArgs,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission(PERMISSION);

    return toTemplateView(
      key,
      await models.NotificationTemplates.publish(
        key,
        input,
        user._id,
        draftRevision,
      ),
    );
  },

  async notificationTemplateRevert(
    _root: undefined,
    { key }: { key: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission(PERMISSION);

    return toTemplateView(key, await models.NotificationTemplates.revert(key));
  },

  // only ever to the signed-in user, filled with the sample values
  async notificationTemplateSendTest(
    _root: undefined,
    { key, input }: Omit<TTemplateArgs, 'draftRevision'>,
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission(PERMISSION);

    if (!user.email) {
      throw new ExpectedError(
        'Your account has no email address to send the test to',
      );
    }

    validateTemplateContent(getSystemEmailTemplate(key), input);

    const { html, subject, unresolved } = await renderSample(
      models,
      subdomain,
      key,
      input,
      { markMissing: false },
    );

    if (unresolved.length) {
      throw new ExpectedError(describeUnresolvedPlaceholders(unresolved));
    }

    await sendEmail(
      subdomain,
      {
        toEmails: [user.email],
        title: `[Test] ${subject}`,
        customHtml: html,
        userId: user._id,
      },
      models,
    );

    return user.email;
  },

  async notificationEmailBrandUpdate(
    _root: undefined,
    { input }: { input: Partial<TEmailBrand> },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission(PERMISSION);

    return updateEmailBrand(models, input);
  },
};
