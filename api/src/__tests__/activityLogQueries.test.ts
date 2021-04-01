import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import {
  activityLogFactory,
  brandFactory,
  companyFactory,
  conformityFactory,
  conversationFactory,
  customerFactory,
  dealFactory,
  engageMessageFactory,
  growthHackFactory,
  integrationFactory,
  internalNoteFactory,
  stageFactory,
  taskFactory,
  ticketFactory,
  userFactory
} from '../db/factories';
import { IntegrationsAPI } from '../data/dataSources';
import * as logUtils from '../data/logUtils';
import './setup.ts';

describe('activityLogQueries', () => {
  let brand;
  let integration;
  let deal;
  let ticket;
  let growtHack;
  let task;

  const commonParamDefs = `
    $contentType: String!,
    $contentId: String!,
    $activityType: String,
    $limit: Int,
  `;

  const commonParams = `
    contentType: $contentType
    contentId: $contentId
    activityType: $activityType
    limit: $limit
  `;

  const qryActivityLogs = `
    query activityLogs(${commonParamDefs}) {
      activityLogs(${commonParams}) {
        _id
        action
        contentId
        contentType
        content
        createdAt
        createdBy
    
        createdByDetail
        contentDetail
        contentTypeDetail
      }
    }
  `;

  beforeEach(async () => {
    brand = await brandFactory();
    integration = await integrationFactory({
      brandId: brand._id
    });
    deal = await dealFactory();
    ticket = await ticketFactory();
    growtHack = await growthHackFactory();
    task = await taskFactory();
  });

  test('Activity log', async () => {
    const contentId = faker.random.uuid();
    const contentType = 'customer';

    const spy = jest.spyOn(logUtils, 'fetchLogs');

    spy.mockImplementation(async () => {
      const activityLogs: any[] = [];

      for (let i = 0; i < 3; i++) {
        activityLogs.push(await activityLogFactory({ contentId, contentType }));
      }

      return activityLogs;
    });

    const args = { contentId, contentType };

    const response = await graphqlRequest(
      qryActivityLogs,
      'activityLogs',
      args
    );

    expect(response.length).toBe(3);

    spy.mockRestore();
  });

  test('Activity log content type checklist & checklist', async () => {
    const contentId = faker.random.uuid();

    const spy = jest.spyOn(logUtils, 'fetchLogs');

    spy.mockImplementation(async () => [
      await activityLogFactory({ contentId, contentType: 'checklist' }),
      await activityLogFactory({ contentId, contentType: 'checklistitem' })
    ]);

    const args1 = { contentId, contentType: 'checklist' };
    const args2 = { contentId, contentType: 'checklistitem' };

    const response1 = await graphqlRequest(
      qryActivityLogs,
      'activityLogs',
      args1
    );
    const response2 = await graphqlRequest(
      qryActivityLogs,
      'activityLogs',
      args2
    );

    expect(response1.length).toBe(2);
    expect(response2.length).toBe(2);

    spy.mockRestore();
  });

  test('Activity log with all activity types', async () => {
    const customer = await customerFactory({});

    await conformityFactory({
      mainType: 'customer',
      mainTypeId: customer._id,
      relType: 'task',
      relTypeId: task._id
    });

    await conversationFactory({ customerId: customer._id });
    await internalNoteFactory({ contentTypeId: customer._id });
    await engageMessageFactory({
      customerIds: [customer._id],
      method: 'email'
    });

    const spy = jest.spyOn(logUtils, 'fetchLogs');

    spy.mockImplementation(async () => [
      await activityLogFactory({ contentId: customer._id, contentType: 'sms' })
    ]);

    const dataSources = { IntegrationsAPI: new IntegrationsAPI() };
    const spy1 = jest.spyOn(dataSources.IntegrationsAPI, 'fetchApi');

    spy1.mockImplementation(() => Promise.resolve());

    const activityTypes = [
      { type: 'conversation', content: 'company' },
      { type: 'email', content: 'email' },
      { type: 'internal_note', content: 'internal_note' },
      { type: 'task', content: 'task' },
      { type: 'sms', content: 'sms sent' }
    ];

    for (const t of activityTypes) {
      const args = {
        contentId: customer._id,
        contentType: t.type === 'sms' ? 'sms' : 'customer',
        activityType: t.type
      };

      const response = await graphqlRequest(
        qryActivityLogs,
        'activityLogs',
        args,
        { dataSources }
      );
      expect(response.length).toBe(1);
    }

    spy.mockRestore();
    spy1.mockRestore();
  });

  test('Activity log with created by user', async () => {
    const user = await userFactory();
    const contentId = faker.random.uuid();
    const contentType = 'customer';
    const createdBy = user._id;

    const doc = {
      contentId,
      contentType,
      createdBy
    };

    const spy = jest.spyOn(logUtils, 'fetchLogs');

    spy.mockImplementation(async () => [await activityLogFactory(doc)]);

    const args = { contentId, contentType };

    const response = await graphqlRequest(
      qryActivityLogs,
      'activityLogs',
      args
    );

    expect(response.length).toBe(1);

    spy.mockRestore();
  });

  test('Activity log with created by integration', async () => {
    const contentId = faker.random.uuid();
    const contentType = 'customer';
    const createdBy = integration._id;

    const doc = {
      contentId,
      contentType,
      createdBy
    };

    const spy = jest.spyOn(logUtils, 'fetchLogs');

    spy.mockImplementation(async () => [await activityLogFactory(doc)]);

    const args = { contentId, contentType };

    const response = await graphqlRequest(
      qryActivityLogs,
      'activityLogs',
      args
    );

    expect(response.length).toBe(1);

    spy.mockRestore();
  });

  test('Activity log content type detail', async () => {
    const createdBy = integration._id;

    const types = [
      { type: 'deal', content: deal },
      { type: 'ticket', content: ticket },
      { type: 'task', content: task },
      { type: 'growthHack', content: growtHack }
    ];

    for (const type of types) {
      const spy = jest.spyOn(logUtils, 'fetchLogs');

      const doc = {
        contentId: type.content._id,
        contentType: type.type,
        createdBy
      };

      spy.mockImplementation(async () => [await activityLogFactory(doc)]);

      const args = { contentId: type.content._id, contentType: type.type };

      const response = await graphqlRequest(
        qryActivityLogs,
        'activityLogs',
        args
      );

      expect(response.length).toBe(1);

      spy.mockRestore();
    }
  });

  test('Activity log action merge', async () => {
    const customer = await customerFactory();
    const company = await companyFactory();

    const types = [
      { type: 'company', content: company },
      { type: 'customer', content: customer }
    ];

    for (const type of types) {
      const spy = jest.spyOn(logUtils, 'fetchLogs');

      const doc = {
        contentId: type.content._id,
        contentType: type.type,
        action: 'merge',
        content: []
      };

      spy.mockImplementation(async () => [await activityLogFactory(doc)]);

      const args = { contentId: type.content._id, contentType: type.type };

      const response = await graphqlRequest(
        qryActivityLogs,
        'activityLogs',
        args
      );

      expect(response.length).toBe(1);

      spy.mockRestore();
    }
  });

  test('Activity log action moved', async () => {
    const stage1 = await stageFactory();
    const stage2 = await stageFactory();

    const types = [
      { type: 'deal', content: deal },
      { type: 'ticket', content: ticket },
      { type: 'task', content: task },
      { type: 'growthHack', content: growtHack }
    ];

    for (const type of types) {
      const spy = jest.spyOn(logUtils, 'fetchLogs');

      const doc1 = {
        contentId: type.content._id,
        contentType: type.type,
        action: 'moved',
        content: {
          oldStageId: stage1._id,
          destinationStageId: stage2._id
        }
      };

      const doc2 = {
        contentId: type.content._id,
        contentType: type.type,
        action: 'moved',
        content: {
          oldStageId: '',
          destinationStageId: ''
        }
      };

      spy.mockImplementation(async () => [
        await activityLogFactory(doc1),
        await activityLogFactory(doc2)
      ]);

      const args = { contentId: type.content._id, contentType: type.type };

      const response = await graphqlRequest(
        qryActivityLogs,
        'activityLogs',
        args
      );

      expect(response.length).toBe(2);

      spy.mockRestore();
    }
  });

  test('Activity log action convert', async () => {
    const types = [{ type: 'task', content: task }];

    for (const type of types) {
      const spy = jest.spyOn(logUtils, 'fetchLogs');

      const doc = {
        contentId: type.content._id,
        contentType: type.type,
        action: 'convert'
      };

      spy.mockImplementation(async () => [await activityLogFactory(doc)]);

      const args = { contentId: type.content._id, contentType: type.type };

      const response = await graphqlRequest(
        qryActivityLogs,
        'activityLogs',
        args
      );

      expect(response.length).toBe(1);

      spy.mockRestore();
    }
  });

  test('Activity log action assignee', async () => {
    const deal1 = await dealFactory();

    const doc = {
      contentId: deal1._id,
      contentType: 'deal',
      action: 'assignee',
      content: []
    };

    const spy = jest.spyOn(logUtils, 'fetchLogs');
    spy.mockImplementation(async () => [await activityLogFactory(doc)]);

    const args = { contentId: deal1._id, contentType: 'deal' };

    const response = await graphqlRequest(
      qryActivityLogs,
      'activityLogs',
      args
    );

    expect(response.length).toBe(1);

    spy.mockRestore();
  });
});
