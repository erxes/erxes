import { IContext } from '~/connectionResolvers';

const queries = {
  operationTemplates: async (
    _root,
    { teamId }: { teamId: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('taskRead');

    return models.OperationTemplate.find({ teamId }).sort({ createdAt: -1 });
  },
  operationTemplateDetail: async (
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('taskRead');

    return models.OperationTemplate.getTemplate(_id);
  },
};

const mutations = {
  operationTemplateAdd: async (
    _root,
    doc,
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('taskCreate');

    return models.OperationTemplate.addTemplate(doc, user._id);
  },
  operationTemplateEdit: async (
    _root,
    doc,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('taskUpdate');

    return models.OperationTemplate.editTemplate(doc);
  },
  operationTemplateRemove: async (
    _root,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('taskRemove');

    return models.OperationTemplate.removeTemplate(_id);
  },
};

export { queries, mutations };
