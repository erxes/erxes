import { Departments, Units } from '../../../db/models';
import { IContext } from '../../types';

const structuresMutations = {
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
  },

  async unitsAdd(_root, doc, { user }: IContext) {
    const unit = await Units.createUnit(doc, user);

    return unit;
  },

  async unitsEdit(_root, { _id, ...doc }, { user }: IContext) {
    const unit = await Units.updateUnit(_id, doc, user);

    return unit;
  },

  async unitsRemove(_root, { _id }) {
    const deleteResponse = await Units.removeUnit(_id);

    return deleteResponse;
  }
};

export default structuresMutations;
