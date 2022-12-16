import { IContext } from '../../../connectionResolver';
import {
  ITimeProportion,
  ITimeProportionDocument,
  ITimeProportionsAddParams
} from '../../../models/definitions/timeProportions';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';

const timeProportionsMutations = {
  timeProportionsAdd: async (
    _root: any,
    doc: ITimeProportionsAddParams,
    { user, models, subdomain }: IContext
  ) => {
    const { departmentIds, branchIds, productCategoryId, percents } = doc;
    if (!departmentIds || !branchIds) {
      throw new Error('Must fill departmend and branch');
    }

    if (!departmentIds.length || !branchIds.length) {
      throw new Error('Must fill departmend and branch');
    }

    if (!productCategoryId) {
      throw new Error('Must fill product category');
    }

    const oldTimeProportions = await models.TimeProportions.find({
      departmentId: { $in: departmentIds },
      branchId: { $in: branchIds },
      productCategoryId
    });

    const oldTimePropsByKey = {};
    for (const time of oldTimeProportions) {
      const key = `${time.branchId}_${time.departmentId}_${time.productCategoryId}`;
      oldTimePropsByKey[key] = time;
    }

    const timeFrames = await models.Timeframes.find({
      status: { $ne: 'deleted' }
    })
      .sort({ startTime: 1 })
      .lean();
    const timeFrameIds = timeFrames.map(tf => tf._id);

    if (percents.filter(p => !timeFrameIds.includes(p.timeId)).length) {
      throw new Error('maybe deleted time frame chosen');
    }

    let docs: ITimeProportion[] = [];
    let inserteds: ITimeProportionDocument[] = [];
    const now = new Date();

    for (const branchId of branchIds) {
      for (const departmentId of departmentIds) {
        const key = `${branchId}_${departmentId}_${productCategoryId}`;

        const oldTimeProp = oldTimePropsByKey[key];
        if (oldTimeProp) {
          continue;
        }

        const timeProportionDoc: ITimeProportion & any = {
          departmentId,
          branchId,
          productCategoryId,
          percents,
          createdAt: now,
          modifiedAt: now,
          createdBy: user._id,
          modifiedBy: user._id
        };

        docs.push(timeProportionDoc);
      }
    }

    if (docs.length) {
      inserteds = await models.TimeProportions.insertMany(docs);
    }
    return inserteds;
  },

  timeProportionEdit: async (
    _root,
    doc: ITimeProportion & { _id: string },
    { models, user }: IContext
  ) => {
    const { _id, ...params } = doc;
    const timeProportion = await models.TimeProportions.getTimeProportion({
      _id
    });

    const timeFrames = await models.Timeframes.find({
      status: { $ne: 'deleted' }
    })
      .sort({ startTime: 1 })
      .lean();
    const timeFrameIds = timeFrames.map(tf => tf._id);

    if (doc.percents.filter(p => !timeFrameIds.includes(p.timeId)).length) {
      throw new Error('maybe deleted time frame chosen');
    }

    return await models.TimeProportions.timeProportionEdit(
      _id,
      {
        ...timeProportion,
        ...params
      },
      user
    );
  },

  timeProportionsRemove: async (
    _root: any,
    { _ids }: { _ids: string[] },
    { models }: IContext
  ) => {
    return await models.TimeProportions.timeProportionsRemove(_ids);
  }
};

moduleRequireLogin(timeProportionsMutations);
moduleCheckPermission(timeProportionsMutations, 'manageSalesPlans');

export default timeProportionsMutations;
