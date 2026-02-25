
import { IContext } from '~/connectionResolvers';

const queries = {
  operationTemplates: async (
    _root,
    { teamId }: { teamId: string },
    { models }: IContext
  ) => {
    return models.OperationTemplate.find({ teamId }).sort({ createdAt: -1 });
  },
  operationTemplateDetail: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return models.OperationTemplate.getTemplate(_id);
  },
};

const mutations = {
  operationTemplateAdd: async (
    _root,
    doc,
    { models, user }: IContext
  ) => {
    return models.OperationTemplate.addTemplate(doc, user._id);
  },
  operationTemplateEdit: async (
    _root,
    doc,
    { models }: IContext
  ) => {
    return models.OperationTemplate.editTemplate(doc);
  },
  operationTemplateRemove: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return models.OperationTemplate.removeTemplate(_id);
  },
};

export { queries, mutations };
