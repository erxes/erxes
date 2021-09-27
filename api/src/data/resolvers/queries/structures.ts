import { Departments, Units } from '../../../db/models';

const structureQueries = {
  departments(_root, args: { parentId?: string }) {
    return Departments.find(args).sort({ title: 1 });
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
