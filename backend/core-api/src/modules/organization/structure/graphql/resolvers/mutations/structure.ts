import { IContext } from '~/connectionResolvers';
export const structuresMutations = {
  async structuresAdd(
    _parent: undefined,
    doc,
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('structuresManage');

    const structure = await models.Structures.createStructure(doc, user);

    return structure;
  },

  async structuresEdit(
    _parent: undefined,
    { _id, ...doc },
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('structuresManage');

    const structure = await models.Structures.updateStructure(_id, doc, user);

    return structure;
  },

  async structuresRemove(
    _parent: undefined,
    { _id },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('structuresManage');

    const deleteResponse = await models.Structures.removeStructure(_id);

    return deleteResponse;
  },
};
