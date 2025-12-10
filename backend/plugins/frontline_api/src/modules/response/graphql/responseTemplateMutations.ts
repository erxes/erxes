import {
  IResponseTemplate,
  IResponseTemplatesEdit,
} from '@/response/@types/responseTemplates';
import { IContext } from '~/connectionResolvers';
import { checkPermission } from 'erxes-api-shared/core-modules';

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
    return await models.ResponseTemplates.updateResponseTemplate(_id, fields);
  },

  async responseTemplatesRemove(
    _parent: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.ResponseTemplates.removeResponseTemplate(_id);
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
