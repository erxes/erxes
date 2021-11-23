import { graphqlRequest } from '../db/connection';
import { exmFactory, userFactory } from '../db/factories';
import { Departments, Users } from '../db/models';

import './setup.ts';

describe('Test exm mutations', () => {
  let _exm;
  let _user;
  let context;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});
    _exm = await exmFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Departments.deleteMany({});
    await Users.deleteMany({});
  });

  const commonDeparmentParamsDef = `
        $name: String,
        $description: String,
        $features: [ExmFeatureInput]
    `;

  const commonDeparmentParams = `
        name: $name,
        description: $description,
        features: $features
    `;

  const exmsAdd = `
        mutation exmsAdd(${commonDeparmentParamsDef}) {
            exmsAdd(${commonDeparmentParams}) {
                _id
                name
            }
        }
    `;

  const exmsEdit = `
        mutation exmsEdit($_id: String!, ${commonDeparmentParamsDef}) {
            exmsEdit(_id: $_id, ${commonDeparmentParams}) {
                _id
                name
            }
        }
    `;

  const exmsRemove = `
        mutation exmsRemove($_id: String!) {
            exmsRemove(_id: $_id)
        }
    `;

  test('Add exm', async () => {
    const doc = {
      name: 'name',
      description: 'description'
    };

    const created = await graphqlRequest(exmsAdd, 'exmsAdd', doc, context);

    expect(created.name).toBe(doc.name);
  });

  test('Edit exm', async () => {
    const updateDoc = { _id: _exm._id, name: 'updated name' };

    const exm = await graphqlRequest(exmsEdit, 'exmsEdit', updateDoc, context);

    expect(exm.name).toBe(updateDoc.name);
  });

  test('Remove exm', async () => {
    await graphqlRequest(exmsRemove, 'exmsRemove', { _id: _exm._id }, context);

    expect(await Departments.find()).toHaveLength(0);
  });
});
