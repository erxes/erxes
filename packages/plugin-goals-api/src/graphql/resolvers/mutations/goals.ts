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
    { models }: IContext
  ) {
    await models.Goals.removeGoal(goalTypeIds);

    return goalTypeIds;
  }
};

export default goalMutations;
