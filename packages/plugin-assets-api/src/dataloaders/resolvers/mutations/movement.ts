import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { MODULE_NAMES, putCreateLog } from '../../../logUtils';

const movementMutations = {
  async assetMovementAdd(
    _root,
    doc,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const movement = await models.Movements.movementAdd(
      docModifier(doc),
      user._id
    );

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.MOVEMENT,
        newData: { ...doc.movements },
        object: movement
      },
      user
    );
  },
  async assetMovementRemove(_root, { ids }, { models }: IContext) {
    return await models.Movements.movementRemove(ids);
  },
  async assetMovementUpdate(
    _root,
    { _id, doc },
    { models, docModifier }: IContext
  ) {
    return await models.Movements.movementEdit(_id, docModifier(doc));
  }
};

checkPermission(movementMutations, 'assetMovementAdd', 'manageAssets');
checkPermission(movementMutations, 'assetMovementRemove', 'manageAssets');
checkPermission(movementMutations, 'assetMovementUpdate', 'manageAssets');

export default movementMutations;
