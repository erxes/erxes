import { Departments } from '../../../db/models';

const departmentQueries = {
  departments() {
    return Departments.find().sort({ title: 1 });
  },

  departmentDetail(_root, { _id }) {
    return Departments.getDepartment({ _id });
  }
};

export default departmentQueries;
