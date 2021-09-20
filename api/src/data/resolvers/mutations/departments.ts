import { Departments } from '../../../db/models';
import { IContext } from '../../types';

const departmentMutations = {
  async departmentsAdd(_root, doc, { user }: IContext) {
    const department = await Departments.createDepartment(doc, user);

    return department;
  },

  async departmentsEdit(_root, { _id, ...doc }, { user }: IContext) {
    const department = await Departments.updateDepartment(_id, doc, user);

    return department;
  },

  async departmentsRemove(_root, { _id }) {
    const deleteResponse = await Departments.removeDepartment(_id);

    return deleteResponse;
  }
};

export default departmentMutations;
