import { graphqlRequest } from '../db/connection';
import { departmentFactory, userFactory } from '../db/factories';
import { Departments, Users } from '../db/models';

import './setup.ts';

describe('Test departmant mutations', () => {
  let _department;
  let _user;
  let doc;
  let context;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});
    _department = await departmentFactory({});

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
});
