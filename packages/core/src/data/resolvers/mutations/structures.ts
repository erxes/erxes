import { IContext } from '../../../connectionResolver';
import { checkPermission } from '../../permissions/wrappers';

const structuresMutations = {
  async structuresAdd(_root, doc, { user, models }: IContext) {
    const structure = await models.Structures.createStructure(doc, user);

    return structure;
  },

  async structuresEdit(_root, { _id, ...doc }, { user, models }: IContext) {
    const structure = await models.Structures.updateStructure(_id, doc, user);

    return structure;
  },

  async structuresRemove(_root, { _id }, { models }: IContext) {
    const deleteResponse = await models.Structures.removeStructure(_id);

    return deleteResponse;
  },

  async departmentsAdd(_root, doc, { user, models }: IContext) {
    const department = await models.Departments.createDepartment(doc, user);

    return department;
  },

  async departmentsEdit(_root, { _id, ...doc }, { user, models }: IContext) {
    const department = await models.Departments.updateDepartment(_id, doc, user);

    return department;
  },

  async departmentsRemove(_root, { _id }, { models }: IContext) {
    const deleteResponse = await models.Departments.removeDepartment(_id);

    return deleteResponse;
  },

  async unitsAdd(_root, doc, { user, models }: IContext) {
    const unit = await models.Units.createUnit(doc, user);

    return unit;
  },

  async unitsEdit(_root, { _id, ...doc }, { user, models }: IContext) {
    const unit = await models.Units.updateUnit(_id, doc, user);

    return unit;
  },

  async unitsRemove(_root, { _id }, { models }: IContext) {
    const deleteResponse = await models.Units.removeUnit(_id);

    return deleteResponse;
  },

  async branchesAdd(_root, doc, { user, models }: IContext) {
    const branch = await models.Branches.createBranch(doc, user);

    return branch;
  },

  async branchesEdit(_root, { _id, ...doc }, { user, models }: IContext) {
    const branch = await models.Branches.updateBranch(_id, doc, user);

    return branch;
  },

  async branchesRemove(_root, { _id }, { models }: IContext) {
    const deleteResponse = await models.Branches.removeBranch(_id);

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
