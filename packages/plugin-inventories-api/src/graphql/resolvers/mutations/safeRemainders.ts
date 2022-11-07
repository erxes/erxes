import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import {
  ISafeRemainder,
  ISafeRemainderSubmitParams
} from '../../../models/definitions/safeRemainders';

const safeRemainderMutations = {
  safeRemainderAdd: async (
    _root: any,
    params: ISafeRemainder,
    { models, subdomain, user }: IContext
  ) => {
    return await models.SafeRemainders.createRemainder(
      subdomain,
      params,
      user._id
    );
  },

  safeRemainderRemove: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    // Delete safe remainder items by safe remainder id
    await models.SafeRemainderItems.deleteMany({ remainderId: _id });

    // Delete safe remainder
    return models.SafeRemainders.findByIdAndDelete(_id);
  },

  safeRemainderSubmit: async (
    _root: any,
    params: ISafeRemainderSubmitParams,
    { models, subdomain }: IContext
  ) => {
    await models.SafeRemainders.submitRemainder(subdomain, params);
  }
};

checkPermission(safeRemainderMutations, 'safeRemainderAdd', 'manageRemainders');
checkPermission(
  safeRemainderMutations,
  'safeRemainderRemove',
  'manageRemainders'
);

export default safeRemainderMutations;
