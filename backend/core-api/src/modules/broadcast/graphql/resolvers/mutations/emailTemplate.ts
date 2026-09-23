import { IBroadcastEmailTemplate } from '@/broadcast/@types';
import { IContext } from '~/connectionResolvers';

export const emailTemplateMutations = {
  async broadcastEmailTemplateAdd(
    _root: undefined,
    doc: IBroadcastEmailTemplate,
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastCreate');

    return models.BroadcastEmailTemplates.createEmailTemplate({
      ...doc,
      createdBy: user._id,
    });
  },

  async broadcastEmailTemplateEdit(
    _root: undefined,
    { _id, ...doc }: { _id: string } & Partial<IBroadcastEmailTemplate>,
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastUpdate');

    return models.BroadcastEmailTemplates.updateEmailTemplate(_id, doc);
  },

  async broadcastEmailTemplateRemove(
    _root: undefined,
    { _ids }: { _ids: string[] },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('broadcastDelete');

    await models.BroadcastEmailTemplates.removeEmailTemplates(_ids);

    return { status: 'ok' };
  },
};
