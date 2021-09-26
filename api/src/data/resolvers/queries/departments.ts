import { Departments } from '../../../db/models';

const departmentQueries = {
  departments(_root, args: { parentId?: string }) {
    return Departments.find(args).sort({ title: 1 });
  },

  departmentDetail(_root, { _id }) {
    return Departments.getDepartment({ _id });
  }
};

export default departmentQueries;
