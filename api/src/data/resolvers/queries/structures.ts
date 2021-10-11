import { Departments, Units, Users } from '../../../db/models';
import { Branches, Structures } from '../../../db/models/Structure';

const structureQueries = {
  departments(_root, { depthType }: { depthType?: string }) {
    const doc: { parentId?: any } = {};

    if (depthType === 'parent') {
      doc.parentId = null;
    } else if (depthType === 'children') {
      doc.parentId = { $ne: null };
    }

    return Departments.find(doc).sort({ title: 1 });
  },

  departmentDetail(_root, { _id }) {
    return Departments.getDepartment({ _id });
  },

  units() {
    return Units.find().sort({ title: 1 });
  },

  unitDetail(_root, { _id }) {
    return Units.getUnit({ _id });
  },

  branches(_root, { depthType }: { depthType?: string }) {
    const filter: { parentId?: any } = {};

    if (depthType === 'parent') {
      filter.parentId = null;
    }

    return Branches.find(filter).sort({ title: 1 });
  },

  branchDetail(_root, { _id }) {
    return Branches.getBranch({ _id });
  },

  async noDepartmentUsers(_root, { excludeId }) {
    const userIds: string[] = [];

    const filter: { _id?: { $ne: string } } = {};

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    const departments = await Departments.find(filter);

    departments.forEach(d => {
      if (d.supervisorId) {
        userIds.push(d.supervisorId);
      }

      if (d.userIds && d.userIds.length > 0) {
        userIds.push(...d.userIds);
      }
    });

    return Users.find({ _id: { $nin: userIds } });
  },

  structureDetail(_root, { _id }) {
    return Structures.getStructure({ _id });
  }
};

export default structureQueries;
