import { IContext } from '~/connectionResolvers';
export const positionMutations = {
  async positionsAdd(
    _parent: undefined,
    doc,
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('positionsManage');

    const position = await models.Positions.createPosition(doc, user);
    return position;
  },

  async positionsEdit(
    _parent: undefined,
    { _id, ...doc },
    { user, models, checkPermission }: IContext,
  ) {
    await checkPermission('positionsManage');

    const position = await models.Positions.updatePosition(_id, doc, user);

    return position;
  },

  async positionsRemove(
    _parent: undefined,
    { ids },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('positionsManage');

    if (!ids.length) {
      throw new Error('You must specify at least one position id to remove');
    }

    const position = await models.Positions.removePositions(ids);

    return position;
  },
};
