import { Types } from 'mongoose';
import { models } from './connectionResolver';
import { sendCoreMessage } from './messageBroker';
export const generateFilter = async (params, type, subdomain: string) => {
  let filter: any = {};

  if (params.movementId) {
    filter.movementId = params.movementId;
  }

  if (params.assetId) {
    filter.assetId = params.assetId;
  }

  if (params.assetIds) {
    filter.assetId = { $in: params.assetIds };
  }

  if (params.parentId) {
    if (params.parentId === '*') {
      const assets = await models?.Assets.find({
        parentId: { $in: ['', undefined, null] }
      });
      const assetIds = (assets || []).map(asset => asset._id);
      filter.assetId = { $in: assetIds };
    } else {
      const assets = await models?.Assets.find({ parentId: params.parentId });
      const assetIds = (assets || []).map(asset => asset._id);
      filter.assetId = { $in: assetIds };
    }
  }

  if (params.userId) {
    filter.userId = params.userId;
  }

  if (params.branchId) {
    const branch = await sendCoreMessage({
      subdomain,
      action: 'branches.findOne',
      data: { _id: params.branchId },
      isRPC: true,
      defaultValue: {}
    });

    if (branch) {
      const branchIds = (
        await sendCoreMessage({
          subdomain,
          action: 'branches.find',
          data: { query: { order: { $regex: branch.order } } },
          isRPC: true,
          defaultValue: []
        })
      ).map(branch => branch._id);
      filter.branchId = { $in: branchIds };
    } else {
      filter.branchId = params.branchId;
    }
  }

  if (params.departmentId) {
    const department = await sendCoreMessage({
      subdomain,
      action: 'departments.find',
      data: { _id: params.departmentId },
      isRPC: true,
      defaultValue: {}
    });

    if (department) {
      const departmentIds = (
        await sendCoreMessage({
          subdomain,
          action: 'departments.find',
          data: { order: { $regex: department.order } }
        })
      ).map(department => department._id);
      filter.departmentId = { $in: departmentIds };
    } else {
      filter.departmentId = params.departmentId;
    }

    filter.departmentId = params.departmentId;
  }
  if (params.teamMemberId) {
    filter.teamMemberId = params.teamMemberId;
  }
  if (params.companyId) {
    filter.companyId = params.companyId;
  }
  if (params.customerId) {
    filter.customerId = params.customerId;
  }

  if (params.createdAtFrom) {
    filter.createdAt = { $gt: new Date(params.createdAtFrom) };
  }
  if (params.createdAtTo) {
    filter.createdAt = {
      ...filter.createdAt,
      $lt: new Date(params.createdAtTo)
    };
  }

  if (params.movedAtFrom) {
    filter.movedAt = { $gt: new Date(params.movedAtFrom) };
  }
  if (params.movedAtTo) {
    filter.movedAt = { ...filter.movedAt, $lt: new Date(params.movedAtTo) };
  }

  if (params.modifiedAtFrom) {
    filter.modifiedAt = { $gt: new Date(params.modifiedAtFrom) };
  }
  if (params.modifiedAtTo) {
    filter.modifiedAt = {
      ...filter.modifiedAt,
      $lt: new Date(params.modifiedAtTo)
    };
  }

  if (params.searchValue) {
    if (type === 'movement') {
      filter.$or = [
        { _id: { $regex: new RegExp(`.*${params.searchValue}.*`, 'i') } },
        {
          description: { $regex: new RegExp(`.*${params.searchValue}.*`, 'i') }
        }
      ];
    }
    if (type === 'movementItems') {
      const assetIds = await models?.Assets.find({
        $or: [
          {
            name: { $regex: new RegExp(`.*${params.searchValue}.*`, 'i') }
          },
          {
            code: { $regex: new RegExp(`.*${params.searchValue}.*`, 'i') }
          }
        ]
      }).distinct('_id');

      filter.assetId = { $in: assetIds };
    }
  }

  if (params.withKnowledgebase) {
    let KbFilter: any = { 'kbArticleIds.0': { $exists: 1 } };
    if (!!filter?.assetId?.$in?.length) {
      KbFilter._id = filter?.assetId?.$in;
    }
    const assetIdsWithKb = await models?.Assets.find(KbFilter).distinct('_id');
    filter.assetId = { $in: assetIdsWithKb };
  }

  if (params.onlyCurrent) {
    let pipeline: any = [];

    if (!!filter?.assetId?.$in?.length) {
      pipeline = [{ $match: { assetId: { $in: filter?.assetId?.$in } } }];
    }

    pipeline = [
      ...pipeline,
      {
        $group: {
          _id: '$assetId',
          movements: {
            $push: '$$ROOT'
          }
        }
      },
      { $unwind: '$movements' },
      { $sort: { 'movements.createdAt': -1 } },
      { $group: { _id: '$_id', movements: { $push: '$movements' } } },
      { $replaceRoot: { newRoot: { $arrayElemAt: ['$movements', 0] } } }
    ];

    const movements = await models?.MovementItems.aggregate(pipeline);

    const movementIds = movements?.map(movement => movement._id);
    filter._id = { $in: movementIds };
  }

  return filter;
};
