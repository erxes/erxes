import { Departments, Units } from '../../../db/models';

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
  }
};

export default structureQueries;
