import { IContext } from '../../../connectionResolver';
import { IGoal } from '../../../models/definitions/goals';

interface IGoalsEdit extends IGoal {
  _id: string;
}

const goalMutations = {
  /**
   * Creates a new goal
   */

  async goalsAdd(_root, doc: IGoal, { docModifier, models }: IContext) {
    const goal = await models.Goals.createGoal(docModifier(doc));

    return goal;
  },

  /**
   * Edits a goal
   */

  async goalsEdit(_root, { _id, ...doc }: IGoalsEdit, { models }: IContext) {
    // const result = await models.Goals.findOne({ _id });
    // if (result) {
    //   let updated;
    //   const str1 = result.specificPeriodGoals;
    //   const str2 = doc.specificPeriodGoals;

    //   // Check if str1 is defined before using the includes method
    //   const equal = str1 && str1.includes(str2);

    //   const period = await models.Goals.findOne({
    //     $and: [{ _id }, { periodGoal: doc.periodGoal }]
    //   });

    //   if (period) {
    //     updated = await models.Goals.updateGoal(_id, doc);
    //   } else {
    //     await models.Goals.updateOne(
    //       { _id },
    //       { $unset: { specificPeriodGoals: [] } }
    //     );
    //     updated = await models.Goals.updateGoal(_id, doc);
    //   }
    //   return updated;
    // } else {
    //   // Handle the case when the result is null
    //   return null;
    // }

    await models.Goals.updateOne(
      { _id },
      { $unset: { specificPeriodGoals: [] } }
    );

    const updated = await models.Goals.updateGoal(_id, doc);
    return updated;
  },

  /**
   * Removes a goal
   */

  async goalsRemove(
    _root,
    { goalTypeIds }: { goalTypeIds: string[] },
    { models, user, subdomain }: IContext
  ) {
    await models.Goals.removeGoal(goalTypeIds);

    return goalTypeIds;
  }
};

export default goalMutations;
