import { getPureDate } from '@erxes/api-utils/src/core';
import { IModels } from '../../../connectionResolver';
import { SAFE_REMAINDER_STATUSES } from '../../../models/definitions/constants';

export const getSafeRemainders = async (
  models: IModels,
  params,
  result,
  branch,
  department,
  productById,
  beProductIds
) => {
  const { endDate, beginDate, branchId, departmentId, isDetailed } = params;
  const bDate = getPureDate(beginDate);
  const eDate = getPureDate(endDate);

  const safeRemC1 = await models.SafeRemainderItems.aggregate([
    {
      $match: {
        modifiedAt: { $lt: bDate },
        branchId,
        departmentId,
        productId: { $in: beProductIds }
      }
    },
    {
      $lookup: {
        from: 'safe_remainders',
        let: { letRemainderId: '$remainderId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$letRemainderId']
              }
            }
          },
          {
            $project: {
              mainStatus: '$status'
            }
          }
        ],
        as: 'mainStatus'
      }
    },
    { $unwind: '$mainStatus' },
    { $match: { 'mainStatus.mainStatus': SAFE_REMAINDER_STATUSES.PUBLISHED } },
    {
      $group: {
        _id: {
          branchId: '$branchId',
          departmentId: '$departmentId',
          productId: '$productId'
        },
        count: { $sum: { $subtract: ['$count', '$preCount'] } }
      }
    }
  ]);

  const safeRemBet = await models.SafeRemainderItems.aggregate([
    {
      $match: {
        modifiedAt: { $gte: bDate, $lte: eDate },
        branchId,
        departmentId,
        productId: { $in: beProductIds }
      }
    },
    {
      $lookup: {
        from: 'safe_remainders',
        let: { letRemainderId: '$remainderId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$letRemainderId']
              }
            }
          },
          {
            $project: {
              mainStatus: '$status'
            }
          }
        ],
        as: 'mainStatus'
      }
    },
    { $unwind: '$mainStatus' },
    { $match: { 'mainStatus.mainStatus': SAFE_REMAINDER_STATUSES.PUBLISHED } },
    {
      $group: {
        _id: {
          branchId: '$branchId',
          departmentId: '$departmentId',
          productId: '$productId'
        },
        count: { $sum: { $subtract: ['$count', '$preCount'] } },
        performs: { $push: '$$ROOT' }
      }
    }
  ]);

  const defaultVal = {
    begin: 0,
    receipt: 0,
    spend: 0,
    end: 0,
    performs: []
  };

  for (const row of safeRemC1) {
    const { branchId, departmentId, productId } = row._id;
    if (!result[branchId]) {
      result[branchId] = {
        branch: `${branch.code} - ${branch.title}`,
        values: {}
      };
    }

    if (!result[branchId].values[departmentId]) {
      result[branchId].values[departmentId] = {
        department: `${department.code}- ${department.title}`,
        values: {}
      };
    }

    if (!result[branchId].values[departmentId].values[productId]) {
      result[branchId].values[departmentId].values[productId] = {
        product: `${(productById[productId] || {}).code} - ${
          (productById[productId] || {}).name
        }`,
        values: { ...defaultVal }
      };
    }

    result[branchId].values[departmentId].values[productId].values.begin +=
      row.count;
    result[branchId].values[departmentId].values[productId].values.end +=
      row.count;
  }

  for (const row of safeRemBet) {
    const { branchId, departmentId, productId } = row._id;

    if (!result[branchId]) {
      result[branchId] = {
        branch: `${branch.code} - ${branch.title}`,
        values: {}
      };
    }

    if (!result[branchId].values[departmentId]) {
      result[branchId].values[departmentId] = {
        department: `${department.code}- ${department.title}`,
        values: {}
      };
    }

    if (!result[branchId].values[departmentId].values[productId]) {
      result[branchId].values[departmentId].values[productId] = {
        product: `${(productById[productId] || {}).code} - ${
          (productById[productId] || {}).name
        }`,
        values: { ...defaultVal }
      };
    }

    if (row.count !== 0) {
      if (row.count > 0) {
        result[branchId].values[departmentId].values[
          productId
        ].values.receipt += row.count;
      } else {
        result[branchId].values[departmentId].values[productId].values.spend +=
          -1 * row.count;
      }

      result[branchId].values[departmentId].values[productId].values.end +=
        row.count;
    }

    if (isDetailed) {
      result[branchId].values[departmentId].values[
        productId
      ].values.performs = result[branchId].values[departmentId].values[
        productId
      ].values.performs.concat(
        (row.performs || []).map(p => {
          const item =
            p.count > p.preCount
              ? { receipt: p.count - p.preCount, spend: 0 }
              : { receipt: 0, spend: p.preCount - p.count };
          return {
            ...p,
            date: p.modifiedAt,
            spec: 'census',
            item
          };
        })
      );
    }
  }

  return result;
};
