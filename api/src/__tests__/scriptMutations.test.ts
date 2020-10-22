import { graphqlRequest } from '../db/connection';
import { brandFactory, formFactory, integrationFactory } from '../db/factories';
import { Brands, Forms, Integrations, Scripts, Users } from '../db/models';

import './setup.ts';

describe('scriptMutations', () => {
  let doc;
  let lead;
  let messenger;
  let brand;

  beforeEach(async () => {
    // Creating test data
    const form = await formFactory();

    brand = await brandFactory();
    lead = await integrationFactory({ formId: form._id, kind: 'lead', brandId: brand._id });
    messenger = await integrationFactory({ kind: 'messenger', brandId: brand._id });

    doc = {
      name: 'name',
      messengerId: messenger._id,
      leadIds: [lead._id],
      kbTopicId: 'kbTopicId',
    };
  });

  afterEach(async () => {
    // Clearing test data
    await Users.deleteMany({});
    await Scripts.deleteMany({});
    await Integrations.deleteMany({});
    await Forms.deleteMany({});
    await Brands.deleteMany({});
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

    const script = await graphqlRequest(mutation, 'scriptsAdd', doc);

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
    const integration = (messenger = await integrationFactory({ kind: 'messenger', brandId: brand._id }));

    const updateDoc = {
      name: 'name_updated',
      messengerId: integration._id,
      leadIds: [lead._id],
      kbTopicId: 'kbTopicId_updated',
    };

    const script = await graphqlRequest(mutation, 'scriptsEdit', { _id: newScript._id, ...updateDoc });

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
    await graphqlRequest(mutation, 'scriptsRemove', { _id: script._id });

    expect(await Scripts.find({}).countDocuments()).toBe(0);
  });
});
