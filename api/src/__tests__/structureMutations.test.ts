import { graphqlRequest } from '../db/connection';
import {
  branchFactory,
  departmentFactory,
  structureFactory,
  unitFactory,
  userFactory
} from '../db/factories';
import { Branches, Departments, Structures, Units, Users } from '../db/models';

import './setup.ts';

describe('Test departmant mutations', () => {
  let _structure;
  let _department;
  let _unit;
  let _branch;
  let _user;
  let context;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});
    _structure = await structureFactory({});
    _department = await departmentFactory({});
    _unit = await unitFactory({});
    _branch = await branchFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Structures.deleteMany({});
    await Departments.deleteMany({});
    await Users.deleteMany({});
    await Units.deleteMany({});
    await Branches.deleteMany({});
  });

  const commonStructureParamsDef = `
        $title: String!,
        $description: String,
        $code: String
        $supervisorId: String
    `;

  const commonStructureParams = `
        title: $title,
        description: $description
        code: $code
        supervisorId: $supervisorId
    `;

  const structuresAdd = `
        mutation structuresAdd(${commonStructureParamsDef}) {
            structuresAdd(${commonStructureParams}) {
                _id
                title
            }
        }
    `;

  const structuresEdit = `
        mutation structuresEdit($_id: String!, ${commonStructureParamsDef}) {
            structuresEdit(_id: $_id, ${commonStructureParams}) {
                _id
                title
            }
        }
    `;

  const structuresRemove = `
        mutation structuresRemove($_id: String!) {
            structuresRemove(_id: $_id)
        }
    `;

  test('Add structure', async () => {
    const doc = {
      title: _structure.title,
      description: _structure.description
    };

    const created = await graphqlRequest(
      structuresAdd,
      'structuresAdd',
      doc,
      context
    );

    expect(created.title).toBe(doc.title);
  });

  test('Edit structure', async () => {
    const updateDoc = { _id: _structure._id, title: 'updated title' };

    const structure = await graphqlRequest(
      structuresEdit,
      'structuresEdit',
      updateDoc,
      context
    );

    expect(structure.title).toBe(updateDoc.title);
  });

  test('Remove structure', async () => {
    await graphqlRequest(
      structuresRemove,
      'structuresRemove',
      { _id: _structure._id },
      context
    );

    expect(await Structures.find()).toHaveLength(0);
  });

  const commonDepartmentParamsDef = `
        $title: String,
        $description: String,
        $parentId: String
        $userIds: [String]
    `;

  const commonDepartmentParams = `
        title: $title,
        description: $description
        parentId: $parentId
        userIds: $userIds
    `;

  const departmentsAdd = `
        mutation departmentsAdd(${commonDepartmentParamsDef}) {
            departmentsAdd(${commonDepartmentParams}) {
                _id
                title
            }
        }
    `;

  const departmentsEdit = `
        mutation departmentsEdit($_id: String!, ${commonDepartmentParamsDef}) {
            departmentsEdit(_id: $_id, ${commonDepartmentParams}) {
                _id
                title
            }
        }
    `;

  const departmentsRemove = `
        mutation departmentsRemove($_id: String!) {
            departmentsRemove(_id: $_id)
        }
    `;

  test('Add department', async () => {
    const doc = {
      title: _department.title,
      description: _department.description
    };

    const created = await graphqlRequest(
      departmentsAdd,
      'departmentsAdd',
      doc,
      context
    );

    expect(created.title).toBe(doc.title);
  });

  test('Edit department', async () => {
    const updateDoc = { _id: _department._id, title: 'updated title' };

    const department = await graphqlRequest(
      departmentsEdit,
      'departmentsEdit',
      updateDoc,
      context
    );

    expect(department.title).toBe(updateDoc.title);
  });

  test('Remove department', async () => {
    await graphqlRequest(
      departmentsRemove,
      'departmentsRemove',
      { _id: _department._id },
      context
    );

    expect(await Departments.find()).toHaveLength(0);
  });

  const commonUnitParamsDef = `
        $title: String,
        $description: String,
        $departmentId: String
        $userIds: [String]
    `;

  const commonUnitParams = `
        title: $title,
        description: $description
        departmentId: $departmentId
        userIds: $userIds
    `;

  const unitsAdd = `
        mutation unitsAdd(${commonUnitParamsDef}) {
            unitsAdd(${commonUnitParams}) {
                _id
                title
            }
        }
    `;

  const unitsEdit = `
        mutation unitsEdit($_id: String!, ${commonUnitParamsDef}) {
            unitsEdit(_id: $_id, ${commonUnitParams}) {
                _id
                title
            }
        }
    `;

  const unitsRemove = `
        mutation unitsRemove($_id: String!) {
            unitsRemove(_id: $_id)
        }
    `;

  test('Add unit', async () => {
    const doc = {
      title: _unit.title,
      description: _unit.description
    };

    const created = await graphqlRequest(unitsAdd, 'unitsAdd', doc, context);

    expect(created.title).toBe(doc.title);
  });

  test('Edit unit', async () => {
    const updateDoc = { _id: _unit._id, title: 'updated title' };

    const unit = await graphqlRequest(
      unitsEdit,
      'unitsEdit',
      updateDoc,
      context
    );

    expect(unit.title).toBe(updateDoc.title);
  });

  test('Remove unit', async () => {
    await graphqlRequest(
      unitsRemove,
      'unitsRemove',
      { _id: _unit._id },
      context
    );

    expect(await Units.find()).toHaveLength(0);
  });

  const commonBranchParamsDef = `
        $title: String,
        $address: String,
        $parentId: String
        $userIds: [String]
    `;

  const commonBranchParams = `
        title: $title,
        address: $address
        parentId: $parentId
        userIds: $userIds
    `;

  const branchesAdd = `
        mutation branchesAdd(${commonBranchParamsDef}) {
            branchesAdd(${commonBranchParams}) {
                _id
                title
            }
        }
    `;

  const branchesEdit = `
        mutation branchesEdit($_id: String!, ${commonBranchParamsDef}) {
            branchesEdit(_id: $_id, ${commonBranchParams}) {
                _id
                title
            }
        }
    `;

  const branchesRemove = `
        mutation branchesRemove($_id: String!) {
            branchesRemove(_id: $_id)
        }
    `;

  test('Add branch', async () => {
    const doc = { title: _branch.title };

    const created = await graphqlRequest(
      branchesAdd,
      'branchesAdd',
      doc,
      context
    );

    expect(created.title).toBe(doc.title);
  });

  test('Edit branch', async () => {
    const updateDoc = { _id: _branch._id, title: 'updated title' };

    const branch = await graphqlRequest(
      branchesEdit,
      'branchesEdit',
      updateDoc,
      context
    );

    expect(branch.title).toBe(updateDoc.title);
  });

  test('Remove branch', async () => {
    await graphqlRequest(
      branchesRemove,
      'branchesRemove',
      { _id: _branch._id },
      context
    );

    expect(await Branches.find()).toHaveLength(0);
  });
});
