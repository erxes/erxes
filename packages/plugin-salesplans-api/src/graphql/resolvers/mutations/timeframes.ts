import {
  moduleRequireLogin,
  moduleCheckPermission
} from '@erxes/api-utils/src/permissions';
import { IContext, IModels } from '../../../connectionResolver';
import {
  ITimeframe,
  ITimeframeDocument
} from '../../../models/definitions/timeframes';

const timeframeMutations = {
  timeframesEdit: async (
    _root: any,
    doc: { update: ITimeframeDocument[]; add: ITimeframe[] },
    { models }: IContext
  ) => {
    return await models.Timeframes.timeframesEdit(doc);
  },

  timeframesRemove: async (_root: any, _id: string, { models }: IContext) => {
    return await models.Timeframes.timeframesRemove(_id);
  }
};

moduleRequireLogin(timeframeMutations);
moduleCheckPermission(timeframeMutations, 'manageSalesPlans');

export default timeframeMutations;
