import { STRUCTURE_STATUSES } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';

const getFilterOrder = async (
  models: IModels,
  type: string,
  user: IUserDocument,
  params: any,
) => {
  if (type !== 'branch' && type !== 'department') {
    return;
  }

  if (params.withoutUserFilter || user.isOwner) {
    return;
  }

  if (
    !(await models.Configs.findOne({
      code: 'CHECK_TEAM_MEMBER_SHOWN',
      value: true,
    }))
  ) {
    return;
  }

  let fieldName = '';
  let userField = '';
  let collection;

  if (type === 'branch') {
    fieldName = 'BRANCHES';
    userField = 'branchIds';
    collection = models.Branches;
  }

  if (type === 'department') {
    fieldName = 'DEPARTMENTS';
    userField = 'departmentIds';
    collection = models.Departments;
  }

  const mastersStructure = await models.Configs.findOne({
    code: `${fieldName}_MASTER_TEAM_MEMBERS_IDS`,
    value: { $in: [user._id] },
  });
  if (mastersStructure) {
    return;
  }

  const userDetail = await models.Users.findOne({ _id: user._id });
  const items = await collection.find({
    _id: { $in: userDetail?.[userField] },
  });

  const itemOrders = items.map((item) => new RegExp(item.order, 'i'));

  return { $in: itemOrders };
};

const getFilterOrderSearch = async (
  models: IModels,
  type: string,
  structureFilter: any,
  filterOrder?: any,
) => {
  let collection;

  if (type === 'branch') {
    collection = models.Branches;
  }

  if (type === 'department') {
    collection = models.Departments;
  }

  if (filterOrder) {
    structureFilter.order = filterOrder;
  }

  const objOrders = (await collection.find(structureFilter))
    .map((obj) => obj.code)
    .join('|');
  return { $regex: new RegExp(objOrders) };
};

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

  if (params?.ids?.length) {
    filter._id = { [params.excludeIds ? '$nin' : '$in']: params.ids };
  }

  if (params.status) {
    filter.status = params.status;
  }

  if (params.onlyFirstLevel) {
    filter.parentId = { $in: [null, ''] };
  }

  if (params?.parentId) {
    filter.parentId = params.parentId;
  }

  const filterOrder = await getFilterOrder(models, type, user, params);

  if (filterOrder) {
    filter.order = filterOrder;
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

    if (type === 'position') {
      return { $and: [filter, structureFilter] };
    }

    if (type === 'department' || type === 'branch') {
      filter.order = await getFilterOrderSearch(
        models,
        type,
        structureFilter,
        filter.order,
      );
    }
  }

  return filter;
};
