import { IContext } from '../../../connectionResolver';
import {
  IDayLabel,
  IDayLabelsAddParams
} from '../../../models/definitions/dayLabels';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';

const dayLabelsMutations = {
  dayLabelsAdd: async (
    _root: any,
    doc: IDayLabelsAddParams,
    { user, models }: IContext
  ) => {
    const { date, departmentIds, branchIds, labelIds } = doc;

    const latestDayLabels = await models.DayLabels.find({
      // date,
      departmentId: { $in: departmentIds },
      branchId: { $in: branchIds }
    });

    const latestDayLabelsByKey = {};
    for (const dayLabel of latestDayLabels) {
      latestDayLabelsByKey[
        `${dayLabel.branchId}_${dayLabel.departmentId}`
      ] = dayLabel;
    }

    const bulkUpdateOps: any[] = [];
    const bulkCreateOps: any[] = [];
    const updatedIds: string[] = [];
    const now = new Date();
    const inserteds: any = [];

    for (const branchId of branchIds) {
      for (const departmentId of departmentIds) {
        const key = `${branchId}_${departmentId}`;

        const oldDayLabel = latestDayLabelsByKey[key];

        if (oldDayLabel) {
          const newLabelIds = oldDayLabel.labelIds;
          let checkAdded = false;

          for (const labelId of labelIds) {
            if (!newLabelIds.includes(labelId)) {
              checkAdded = true;
              newLabelIds.push(labelId);
            }
          }

          if (checkAdded) {
            updatedIds.push(oldDayLabel._id);

            bulkUpdateOps.push({
              updateOne: {
                filter: {
                  _id: oldDayLabel._id
                },
                update: {
                  $set: {
                    labelIds,
                    modifiedAt: now,
                    modifiedBy: user._id
                  }
                }
              }
            });
          }
        } else {
          bulkCreateOps.push({
            branchId,
            departmentId,
            labelIds,
            date,
            createdAt: now,
            createBy: user._id
          });
        }
      }
    }

    if (bulkUpdateOps.length) {
      await models.DayLabels.bulkWrite(bulkUpdateOps);
    }

    if (bulkCreateOps.length) {
      const inserted = await models.DayLabels.insertMany(bulkCreateOps);
      inserteds.push(inserted);
    }

    return inserteds.concat(
      await models.DayLabels.find({ _id: { $in: updatedIds } }).lean()
    );
  },

  dayLabelEdit: async (
    _root,
    doc: IDayLabel & { _id: string },
    { models, user }: IContext
  ) => {
    const { _id, ...params } = doc;
    const dayLabel = await models.DayLabels.getDayLabel({ _id });
    return await models.DayLabels.dayLabelEdit(
      _id,
      {
        ...dayLabel,
        ...params
      },
      user
    );
  },

  dayLabelsRemove: async (
    _root: any,
    { _ids }: { _ids: string[] },
    { models }: IContext
  ) => {
    return await models.DayLabels.dayLabelsRemove(_ids);
  }
};

moduleRequireLogin(dayLabelsMutations);
moduleCheckPermission(dayLabelsMutations, 'manageSalesPlans');

export default dayLabelsMutations;
