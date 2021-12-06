import { Structures, Departments, Units, Branches } from '../../../db/models';
import { IContext } from '../../types';
import { checkPermission } from '../../permissions/wrappers';

const structuresMutations = {
  async structuresAdd(_root, doc, { user }: IContext) {
    const structure = await Structures.createStructure(doc, user);

    return structure;
  },

  async structuresEdit(_root, { _id, ...doc }, { user }: IContext) {
    const structure = await Structures.updateStructure(_id, doc, user);

    return structure;
  },

  async structuresRemove(_root, { _id }) {
    const deleteResponse = await Structures.removeStructure(_id);

    return deleteResponse;
  },

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
  },

  async branchesAdd(_root, doc, { user }: IContext) {
    const branch = await Branches.createBranch(doc, user);

    return branch;
  },

  async branchesEdit(_root, { _id, ...doc }, { user }: IContext) {
    const branch = await Branches.updateBranch(_id, doc, user);

    return branch;
  },

  async branchesRemove(_root, { _id }) {
    const deleteResponse = await Branches.removeBranch(_id);

    return deleteResponse;
  }
};

checkPermission(structuresMutations, 'structuresAdd', 'addStructure');
checkPermission(structuresMutations, 'structuresEdit', 'editStructure');
checkPermission(structuresMutations, 'structuresRemove', 'removeStructure');

checkPermission(structuresMutations, 'departmentsAdd', 'addDepartment');
checkPermission(structuresMutations, 'departmentsEdit', 'editDepartment');
checkPermission(structuresMutations, 'departmentsRemove', 'removeDepartment');

checkPermission(structuresMutations, 'unitsAdd', 'addUnit');
checkPermission(structuresMutations, 'unitsEdit', 'editUnit');
checkPermission(structuresMutations, 'unitsRemove', 'removeUnit');

checkPermission(structuresMutations, 'branchesAdd', 'addBranch');
checkPermission(structuresMutations, 'branchesEdit', 'editBranch');
checkPermission(structuresMutations, 'branchesRemove', 'removeBranch');

export default structuresMutations;
