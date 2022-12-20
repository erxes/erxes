import { IContext } from '../../../connectionResolver';
import * as moment from 'moment';
import {
  IDayLabel,
  IDayLabelsAddParams
} from '../../../models/definitions/dayLabels';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';

const getDateStr = date => {
  return moment(date).format('YYYYMMDD');
};

const dayLabelsMutations = {
  dayLabelsAdd: async (
    _root: any,
    doc: IDayLabelsAddParams,
    { user, models }: IContext
  ) => {
    const { dates, departmentIds, branchIds, labelIds } = doc;

    const oldDayLabels = await models.DayLabels.find({
      date: { $in: dates },
      departmentId: { $in: departmentIds },
      branchId: { $in: branchIds }
    });

    const oldDayLabelsByKey = {};
    for (const dayLabel of oldDayLabels) {
      oldDayLabelsByKey[
        `${dayLabel.branchId}_${dayLabel.departmentId}_${getDateStr(
          dayLabel.date
        )}`
      ] = dayLabel;
    }

    const bulkUpdateOps: any[] = [];
    const bulkCreateOps: any[] = [];
    const updatedIds: string[] = [];
    const now = new Date();
    const inserteds: any = [];

    for (const strDate of dates) {
      const date = new Date(strDate);
      for (const branchId of branchIds) {
        for (const departmentId of departmentIds) {
          const key = `${branchId}_${departmentId}_${getDateStr(date)}`;

          const oldDayLabel = oldDayLabelsByKey[key];

          if (oldDayLabel) {
            const newLabelIds = [...oldDayLabel.labelIds];
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
                      labelIds: newLabelIds,
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
