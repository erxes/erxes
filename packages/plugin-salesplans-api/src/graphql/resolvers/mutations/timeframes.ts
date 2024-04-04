import { IContext } from '../../../connectionResolver';
import { ITimeframe } from '../../../models/definitions/timeframes';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';

interface IEditArgs extends ITimeframe {
  _id?: string;
}
const timeframeMutations = {
  timeframesEdit: async (
    _root: any,
    { docs }: { docs: any[] },
    { models }: IContext
  ) => {
    return await models.Timeframes.timeframesEdit(docs);
  }
};

moduleRequireLogin(timeframeMutations);
moduleCheckPermission(timeframeMutations, 'manageSalesPlans');

export default timeframeMutations;
