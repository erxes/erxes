import { graphqlRequest } from '../db/connection';
import { departmentFactory, unitFactory, userFactory } from '../db/factories';
import { Departments, Units, Users } from '../db/models';

import './setup.ts';

describe('Test departmant mutations', () => {
  let _department;
  let _unit;
  let _user;
  let doc;
  let context;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});
    _department = await departmentFactory({});
    _unit = await unitFactory({});

    context = { user: _user };

    doc = {
      title: _department.title,
      description: _department.description
    };
  });

  afterEach(async () => {
    // Clearing test data
    await Departments.deleteMany({});
    await Users.deleteMany({});
    await Units.deleteMany({});
  });

  const commonDeparmentParamsDef = `
        $title: String,
        $description: String,
        $parentId: String
        $userIds: [String]
    `;

  const commonDeparmentParams = `
        title: $title,
        description: $description
        parentId: $parentId
        userIds: $userIds
    `;

  const departmentsAdd = `
        mutation departmentsAdd(${commonDeparmentParamsDef}) {
            departmentsAdd(${commonDeparmentParams}) {
                _id
                title
            }
        }
    `;

  const departmentsEdit = `
        mutation departmentsEdit($_id: String!, ${commonDeparmentParamsDef}) {
            departmentsEdit(_id: $_id, ${commonDeparmentParams}) {
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
});
