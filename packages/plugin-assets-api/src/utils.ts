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
        parentId: ''
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
      filter._id = new RegExp(`.*${params.searchValue}.*`, 'i');
    }
    if (type === 'movementItems') {
      filter.assetName = new RegExp(`.*${params.searchValue}.*`, 'i');
    }
  }

  return filter;
};
