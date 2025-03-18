import { putCreateLog, putDeleteLog, putUpdateLog } from "@erxes/api-utils/src";
import { IContext } from "../../../connectionResolver";

const activityMutations = {
  /**
   * Creates a new activity
   */
  activityAdd: async (
    _root,
    doc,
    { user, docModifier, models, subdomain }: IContext
  ) => {
    const activity = await models.Activities.createActivity(
      docModifier(doc),
      user
    );

    await putCreateLog(
      subdomain,
      {
        type: "activities:activity",
        newData: doc,
        object: activity,
        extraParams: { models },
        description: `"${activity.name}" has been created`,
      },
      user
    );

    return activity;
  },
  /**
   * Edit a activity
   */
  activityEdit: async (_root, { _id, ...doc }, { models, user, subdomain }) => {
    const activity = await models.Activities.getActivity(_id);
    const updated = await models.Activities.updateActivity(_id, doc);

    await putUpdateLog(
      subdomain,
      {
        type: "activities:activity",
        object: activity,
        newData: { ...doc },
        updatedDocument: updated,
        extraParams: { models },
        description: `"${activity.name}" has been updated`,
      },
      user
    );

    return updated;
  },
  /**
   * Removes activities
   */
  activitiesRemove: async (
    _root,
    { activityIds }: { activityIds: string[] },
    { models, user, subdomain }: IContext
  ) => {
    const activities = await models.Activities.find({
      _id: { $in: activityIds },
    }).lean();

    await models.Activities.removeActivities(activityIds);

    for (const activity of activities) {
      await putDeleteLog(
        subdomain,
        {
          type: "activity:activity",
          object: activity,
          description: `"${activity.name}" has been deleted`,
          extraParams: { models },
        },
        user
      );
    }

    return activityIds;
  },
  /**
   * Change a status of activity
   */
  changeActivityStatus: async (
    _root,
    { _id, status }: { _id: string; status: string },
    { models, user, subdomain }: IContext
  ) => {
    const updated = await models.Activities.findOneAndUpdate(
      { _id },
      { $set: { status } },
      { new: true }
    );
    return updated;
  },
  /**
   * Create a activity category
   */
  activityCategoryAdd: async (
    _root,
    doc,
    { docModifier, models, subdomain, user }
  ) => {
    const activityCategory =
      await models.ActivityCategories.createActivityCategory(docModifier(doc));

    await putCreateLog(
      subdomain,
      {
        type: "activities:activity-category",
        newData: { ...doc, order: activityCategory.order },
        object: activityCategory,
        description: `"${activityCategory.name}" has been created`,
        extraParams: { models },
      },
      user
    );

    return activityCategory;
  },
  /**
   * Edits a activity category
   */
  activityCategoryEdit: async (
    _root,
    { _id, ...doc },
    { models, user, subdomain }
  ) => {
    const activityCategory =
      await models.ActivityCategories.getActivityCategory({
        _id,
      });
    const updated = await models.ActivityCategories.updateActivityCategory(
      _id,
      doc
    );

    await putUpdateLog(
      subdomain,
      {
        type: "activities:activity-category",
        object: activityCategory,
        newData: doc,
        updatedDocument: updated,
        description: `"${activityCategory.name}" has been updated`,
        extraParams: { models },
      },
      user
    );

    return updated;
  },
  /**
   * Delete a activity category
   */
  activityCategoryRemove: async (
    _root,
    { _id }: { _id: string },
    { models, subdomain, user }: IContext
  ) => {
    const activityCategory =
      await models.ActivityCategories.getActivityCategory({
        _id,
      });
    const removed = await models.ActivityCategories.removeActivityCategory(_id);

    await putDeleteLog(
      subdomain,
      {
        type: "activities:activity-category",
        object: activityCategory,
        description: `"${activityCategory.name}" has been deleted`,
        extraParams: { models },
      },
      user
    );

    return removed;
  },
};

export default activityMutations;
