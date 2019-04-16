import { graphqlRequest } from '../db/connection';
import { userFactory } from '../db/factories';
import { Scripts, Users } from '../db/models';

describe('scriptMutations', () => {
  let _user;
  let context;

  beforeEach(async () => {
    // Creating test data
    _user = await userFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await Users.deleteMany({});
    await Scripts.deleteMany({});
  });

  const commonParamDefs = `
    $name: String!
    $messengerId: String
    $kbTopicId: String
    $leadIds: [String]
  `;

  const commonParams = `
    name: $name
    messengerId: $messengerId
    kbTopicId: $kbTopicId
    leadIds: $leadIds
  `;

  const doc = {
    name: 'name',
    messengerId: 'messengerId',
    leadIds: ['leadIds'],
    kbTopicId: 'kbTopicId',
  };

  test('scriptsAdd', async () => {
    const mutation = `
      mutation scriptsAdd(${commonParamDefs}) {
        scriptsAdd(${commonParams}) {
          name
          messengerId
          leadIds
          kbTopicId
        }
      }
    `;

    const script = await graphqlRequest(mutation, 'scriptsAdd', doc, context);

    expect(script.name).toBe(doc.name);
    expect(script.messengerId).toBe(doc.messengerId);
    expect(script.leadIds[0]).toBe(doc.leadIds[0]);
    expect(script.kbTopicId).toBe(doc.kbTopicId);
  });

  test('scriptsEdit', async () => {
    const mutation = `
      mutation scriptsEdit($_id: String! ${commonParamDefs}){
        scriptsEdit(_id: $_id ${commonParams}) {
          _id
          name
          messengerId
          leadIds
          kbTopicId
        }
      }
    `;

    const newScript = await Scripts.create(doc);

    const updateDoc = {
      name: 'name_updated',
      messengerId: 'messengerId_updated',
      leadIds: ['leadIds_updated'],
      kbTopicId: 'kbTopicId_updated',
    };

    const script = await graphqlRequest(mutation, 'scriptsEdit', { _id: newScript._id, ...updateDoc }, context);

    expect(script.name).toBe(updateDoc.name);
    expect(script.messengerId).toBe(updateDoc.messengerId);
    expect(script.leadIds[0]).toBe(updateDoc.leadIds[0]);
    expect(script.kbTopicId).toBe(updateDoc.kbTopicId);
  });

  test('scriptsRemove', async () => {
    const mutation = `
      mutation scriptsRemove($_id: String!) {
        scriptsRemove(_id: $_id)
      }
    `;

    const script = await Scripts.create(doc);
    await graphqlRequest(mutation, 'scriptsRemove', { _id: script._id }, context);

    expect(await Scripts.find({}).countDocuments()).toBe(0);
  });
});
