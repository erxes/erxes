import { STRUCTURE_STATUSES } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';

export const generateFilters = async ({
  models,
  user,
  type,
  params,
}: {
  models: IModels;
  user: IUserDocument;
  type: string;
  params: any;
}) => {
  const filter: any = { status: { $ne: STRUCTURE_STATUSES.DELETED } };

  if (params.ids && params.ids.length) {
    filter._id = { [params.excludeIds ? '$nin' : '$in']: params.ids };
  }

  if (params.status) {
    filter.status = params.status;
  }

  if (!params.withoutUserFilter) {
    const userDetail = await models.Users.findOne({ _id: user._id });
    if (type === 'branch') {
      const branches = await models.Branches.find({
        _id: { $in: userDetail?.branchIds },
      });

      const branchOrders = branches.map(
        (branch) => new RegExp(branch.order, 'i'),
      );

      filter.order = { $in: branchOrders };
    }
    if (type === 'department') {
      const departments = await models.Departments.find({
        _id: { $in: userDetail?.departmentIds },
      });

      const departmentOrders = departments.map(
        (department) => new RegExp(department.order, 'i'),
      );

      filter.order = { $in: departmentOrders };
    }
  }

  let fieldName = '';

  if (type === 'department') {
    fieldName = 'DEPARTMENTS';
  }
  if (type === 'branch') {
    fieldName = 'BRANCHES';
  }
  const mastersStructure = await models.Configs.findOne({
    code: `${fieldName}_MASTER_TEAM_MEMBERS_IDS`,
    value: { $in: [user._id] },
  });

  if (filter.order && (user.isOwner || mastersStructure)) {
    delete filter.order;
  }
  if (params.searchValue) {
    const regexOption = {
      $regex: `.*${params.searchValue.trim()}.*`,
      $options: 'i',
    };

    const structureFilter: any = {
      $or: [
        { title: regexOption },
        { description: regexOption },
        { code: regexOption },
      ],
    };

    if (filter.order) {
      structureFilter.order = filter.order;
    }

    if (type === 'department') {
      const departmentOrders = (await models.Departments.find(structureFilter))
        .map((department) => department.code)
        .join('|');
      filter.order = { $regex: new RegExp(departmentOrders) };
    }

    if (type === 'branch') {
      const branchOrders = (await models.Branches.find(structureFilter))
        .map((department) => department.code)
        .join('|');
      filter.order = { $regex: new RegExp(branchOrders, 'i') };
    }

    if (type === 'position' && params.searchValue) {
      return { $and: [filter, structureFilter] };
    }
  }

  if (params.onlyFirstLevel) {
    filter.parentId = { $in: [null, ''] };
  }

  if (params?.parentId) {
    filter.parentId = params.parentId;
  }

  return filter;
};
