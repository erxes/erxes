import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

import { IGoal } from '../../../models/definitions/goals';
import { fixRelatedItems, goalObject } from '../../../utils';
// import {
//   putCreateLog,
//   putDeleteLog,
//   putUpdateLog,
//   putActivityLog
// } from '../../../logUtils';

import { sendCommonMessage } from '../../../messageBroker';
import { serviceDiscovery } from '../../../configs';

interface IGoalsEdit extends IGoal {
  _id: string;
}

const goalMutations = {
  /**
   * Creates a new goal
   */

  async goalsAdd(
    _root,
    doc: IGoal,
    { docModifier, models, subdomain, user }: IContext
  ) {
    const goal = await models.Goals.createGoal(docModifier(doc));

    return goal;
  },

  /**
   * Edits a goal
   */
  async goalsEdit(
    _root,
    { _id, ...doc }: IGoalsEdit,
    { models, subdomain, user }: IContext
  ) {
    const updated = await models.Goals.updateGoal(_id, doc);

    return updated;
  },

  /**
   * Removes a goal
   */
  goalTypesRemove: async (
    _root,
    { goalTypeIds }: { goalTypeIds: string[] },
    { models, user, subdomain }: IContext
  ) => {
    // TODO: contracts check
    // const goalTypes = await models.Goals.find({
    //   _id: { $in: goalTypeIds }
    // }).lean();

    await models.Goals.removeGoal(goalTypeIds);

    return goalTypeIds;
  },
  async goalsRemove(
    _root,
    { goalTypeIds }: { goalTypeIds: string[] },
    { models, user, subdomain }: IContext
  ) {
    await models.Goals.removeGoal(goalTypeIds);

    return goalTypeIds;
  }
};

// requireLogin(goalMutations, 'goalsGoal');

// checkPermission(goalMutations, 'goalsAdd', 'manageGoals');
// checkPermission(goalMutations, 'goalsEdit', 'manageGoals');
// checkPermission(goalMutations, 'goalsRemove', 'manageGoals');
// checkPermission(goalMutations, 'goalsMerge', 'manageGoals');

export default goalMutations;
