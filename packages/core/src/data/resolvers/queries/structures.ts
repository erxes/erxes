import { paginate } from '@erxes/api-utils/src';
import { STRUCTURE_STATUSES } from '../../../constants';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { IContext, IModels } from '../../../connectionResolver';

const generateFilters = async ({
  models,
  user,
  type,
  params
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
    const userDetail = await models.Users.findOne({ _id: user });
    if (type === 'branch') {
      const branches = await models.Branches.find({
        _id: { $in: userDetail?.branchIds }
      });

      const branchOrders = branches.map(
        branch => new RegExp(branch.order, 'i')
      );

      filter.order = { $in: branchOrders };
    }
    if (type === 'department') {
      const departments = await models.Departments.find({
        _id: { $in: userDetail?.departmentIds }
      });

      const departmentOrders = departments.map(
        department => new RegExp(department.order, 'i')
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
    value: { $in: [user._id] }
  });

  if (filter.order && (user.isOwner || mastersStructure)) {
    delete filter.order;
  }
  if (params.searchValue) {
    const regexOption = {
      $regex: `.*${params.searchValue.trim()}.*`,
      $options: 'i'
    };

    let structureFilter: any = {
      $or: [
        { title: regexOption },
        { description: regexOption },
        { code: regexOption }
      ]
    };

    if (filter.order) {
      structureFilter.order = filter.order;
    }

    if (type === 'department') {
      const departmentOrders = (await models.Departments.find(structureFilter))
        .map(department => department.code)
        .join('|');
      filter.order = { $regex: new RegExp(departmentOrders) };
    }

    if (type === 'branch') {
      const branchOrders = (await models.Branches.find(structureFilter))
        .map(department => department.code)
        .join('|');
      filter.order = { $regex: new RegExp(branchOrders, 'i') };
    }
  }

  return filter;
};

const structureQueries = {
  async departments(_root, params: any, { models, user }: IContext) {
    const filter = await generateFilters({
      models,
      user,
      type: 'department',
      params
    });
    const pipeline: any[] = [{ $match: filter }, { $sort: { order: 1 } }];

    if (!!params?.ids?.length) {
      pipeline.push({
        $addFields: {
          __order: { $indexOfArray: [params.ids, '$_id'] }
        }
      });
      pipeline.push({ $sort: { __order: 1 } });
    }
    return models.Departments.aggregate(pipeline);
  },

  async departmentsMain(
    _root,
    params: { searchValue?: string; perPage: number; page: number },
    { models, user }: IContext
  ) {
    const filter = await generateFilters({
      models,
      user,
      type: 'department',
      params: { ...params, withoutUserFilter: true }
    });
    const list = paginate(
      models.Departments.find(filter).sort({ order: 1 }),
      params
    );
    const totalCount = models.Departments.find(filter).countDocuments();

    const totalUsersCount = await models.Users.countDocuments({
      ...filter,
      'departmentIds.0': { $exists: true },
      isActive: true
    });

    return { list, totalCount, totalUsersCount };
  },

  departmentDetail(_root, { _id }, { models }: IContext) {
    return models.Departments.getDepartment({ _id });
  },

  units(
    _root,
    { searchValue }: { searchValue?: string },
    { models }: IContext
  ) {
    const filter: { $or?: any[] } = {};

    if (searchValue) {
      const regexOption = {
        $regex: `.*${searchValue.trim()}.*`,
        $options: 'i'
      };

      filter.$or = [
        {
          title: regexOption
        },
        {
          description: regexOption
        }
      ];
    }

    return models.Units.find(filter).sort({ title: 1 });
  },

  async unitsMain(
    _root,
    params: { searchValue?: string; perPage: number; page: number },
    { models }: IContext
  ) {
    const filter: { $or?: any[] } = {};

    if (params.searchValue) {
      const regexOption = {
        $regex: `.*${params.searchValue.trim()}.*`,
        $options: 'i'
      };

      filter.$or = [
        {
          title: regexOption
        },
        {
          description: regexOption
        }
      ];
    }
    const list = paginate(
      models.Units.find(filter).sort({ createdAt: -1 }),
      params
    );
    const totalCount = models.Units.find(filter).countDocuments();

    const unitUserIds = (await models.Units.find(filter))
      .map(user => user.userIds)
      .flat();

    const totalUsersCount = [...new Set(unitUserIds)].length;

    return { list, totalCount, totalUsersCount };
  },

  unitDetail(_root, { _id }, { models }: IContext) {
    return models.Units.getUnit({ _id });
  },

  async branches(
    _root,
    params: any & { searchValue?: string },
    { models, user }: IContext
  ) {
    const filter = await generateFilters({
      models,
      user,
      type: 'branch',
      params
    });
    const pipeline: any[] = [{ $match: filter }, { $sort: { order: 1 } }];

    if (!!params?.ids?.length) {
      pipeline.push({
        $addFields: {
          __order: { $indexOfArray: [params.ids, '$_id'] }
        }
      });
      pipeline.push({ $sort: { __order: 1 } });
    }

    return models.Branches.aggregate(pipeline);
  },

  async branchesMain(
    _root,
    params: { searchValue?: string; perPage: number; page: number },
    { models, user }: IContext
  ) {
    const filter = await generateFilters({
      models,
      user,
      type: 'branch',
      params: { ...params, withoutUserFilter: true }
    });
    const list = paginate(
      models.Branches.find(filter).sort({ order: 1 }),
      params
    );
    const totalCount = models.Branches.find(filter).countDocuments();
    const totalUsersCount = await models.Users.countDocuments({
      ...filter,
      'branchIds.0': { $exists: true },
      isActive: true
    });

    return { list, totalCount, totalUsersCount };
  },

  branchDetail(_root, { _id }, { models }: IContext) {
    return models.Branches.getBranch({ _id });
  },

  async noDepartmentUsers(_root, { excludeId }, { models }: IContext) {
    const userIds: string[] = [];

    const filter: { _id?: { $ne: string } } = {};

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    const departments = await models.Departments.find(filter);

    departments.forEach(d => {
      if (d.supervisorId) {
        userIds.push(d.supervisorId);
      }

      if (d.userIds && d.userIds.length > 0) {
        userIds.push(...d.userIds);
      }
    });

    return models.Users.findUsers({ _id: { $nin: userIds }, isActive: true });
  },

  structureDetail(_root, _args, { models }: IContext) {
    return models.Structures.findOne();
  }
};

checkPermission(structureQueries, 'structureDetail', 'showStructure');

checkPermission(structureQueries, 'departments', 'showDepartment');
checkPermission(structureQueries, 'departmentsMain', 'showDepartment');
checkPermission(structureQueries, 'departmentDetail', 'showDepartment');

checkPermission(structureQueries, 'units', 'showUnit');
checkPermission(structureQueries, 'unitDetail', 'showUnit');

checkPermission(structureQueries, 'branches', 'showBranch');
checkPermission(structureQueries, 'branchesMain', 'showBranch');
checkPermission(structureQueries, 'branchDetail', 'showBranch');

export default structureQueries;
