import { IResponseTemplate } from '@/response/@types/responseTemplates';
import { IContext } from '~/connectionResolvers';
import { checkPermission } from 'erxes-api-shared/core-modules';
import { IResponseTemplatesEdit } from '@/response/@types/responseTemplates';

export const responseTemplateMutations = {
  async responseTemplatesAdd(
    _parent: undefined,
    doc: IResponseTemplate,
    { models }: IContext,
  ) {
    return await models.ResponseTemplates.create(doc);
  },

  async responseTemplatesEdit(
    _parent: undefined,
    { _id, ...fields }: IResponseTemplatesEdit,
    { models }: IContext,
  ) {
    const updated = await models.ResponseTemplates.updateResponseTemplate(
      _id,
      fields,
    );

    return updated;
  },

  async responseTemplatesRemove(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const removed = await models.ResponseTemplates.removeResponseTemplate(_id);

    return removed;
  },
};

checkPermission(
  responseTemplateMutations,
  'responseTemplatesAdd',
  'manageResponseTemplate',
);
checkPermission(
  responseTemplateMutations,
  'responseTemplatesEdit',
  'manageResponseTemplate',
);
checkPermission(
  responseTemplateMutations,
  'responseTemplatesRemove',
  'manageResponseTemplate',
);
