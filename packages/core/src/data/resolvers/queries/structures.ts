import { IContext } from '../../../connectionResolver';
import { checkPermission } from '../../permissions/wrappers';

const structureQueries = {
  departments(
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

    return models.Departments.find(filter).sort({ title: 1 });
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

  unitDetail(_root, { _id }, { models }: IContext) {
    return models.Units.getUnit({ _id });
  },

  branches(
    _root,
    { searchValue }: { searchValue?: string },
    { models }: IContext
  ) {
    const filter: { parentId?: any; $or?: any[] } = {};

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
          address: regexOption
        }
      ];
    }

    return models.Branches.find(filter).sort({ title: 1 });
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
checkPermission(structureQueries, 'departmentDetail', 'showDepartment');

checkPermission(structureQueries, 'units', 'showUnit');
checkPermission(structureQueries, 'unitDetail', 'showUnit');

checkPermission(structureQueries, 'branches', 'showBranch');
checkPermission(structureQueries, 'branchDetail', 'showBranch');

export default structureQueries;
