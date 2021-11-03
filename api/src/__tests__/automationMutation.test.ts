import './setup.ts';

import * as faker from 'faker';

import AutomationsAPI from '../data/dataSources/automations';
import { graphqlRequest } from '../db/connection';
import { segmentFactory, userFactory } from '../db/factories';
import { Segments, Users } from '../db/models';

describe('Automations mutations', () => {
  let dataSources;
  let user;
  let context;
  let getAutomationSpy;

  const commonParamDefs = `
    $name: String,
    $status: String,
    $triggers: [TriggerInput],
    $actions: [ActionInput],
  `;

  const commonParams = `
    name: $name,
    status: $status,
    triggers: $triggers,
    actions: $actions,
  `;

  const noteParamDefs = `
    $automationId: String,
    $triggerId: String,
    $actionId: String,
    $description: String
  `;
  const noteParams = `
    automationId: $automationId,
    triggerId: $triggerId,
    actionId: $actionId,
    description: $description
  `;

  const defaultArgs = {
    _id: faker.random.uuid(),
    name: faker.random.word(),
    status: 'active'
  };

  beforeEach(async () => {
    // Creating test data
    dataSources = { AutomationsAPI: new AutomationsAPI() };

    getAutomationSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'getAutomationDetail'
    );

    getAutomationSpy.mockImplementation(() => {
      return { ...defaultArgs };
    });

    user = await userFactory({});
    context = { user, dataSources };
  });

  afterEach(async () => {
    await Users.deleteMany({});
    getAutomationSpy.mockRestore();
  });

  test('Add automation', async () => {
    const args = {
      name: faker.random.word(),
      status: 'draft'
    };

    const mutation = `
      mutation automationsAdd(${commonParamDefs}) {
        automationsAdd(${commonParams}) {
          _id
          name
          status
          createdAt
          updatedAt
          createdBy
          updatedBy
        }
      }
    `;

    const createAutomationSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'createAutomation'
    );

    createAutomationSpy.mockImplementation(() => {
      return {
        ...args,
        _id: faker.random.uuid(),
        createdAt: new Date(),
        updateAt: new Date(),
        createdBy: user._id,
        updatedBy: user._id
      };
    });

    const result = await graphqlRequest(
      mutation,
      'automationsAdd',
      args,
      context
    );

    expect(result.name).toBe(args.name);
    expect(result.status).toBe(args.status);
    createAutomationSpy.mockRestore();
  });

  test('Edit automation', async () => {
    const args = defaultArgs;

    const mutation = `
      mutation automationsEdit($_id: String!, ${commonParamDefs}) {
        automationsEdit(_id: $_id, ${commonParams}) {
          _id
          name
          status
          createdAt
          updatedAt
          createdBy
          updatedBy
        }
      }
    `;

    const updateAutomationSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'updateAutomation'
    );

    updateAutomationSpy.mockImplementation(() => {
      return { ...args, updateAt: new Date(), updatedBy: user._id };
    });

    const result = await graphqlRequest(
      mutation,
      'automationsEdit',
      args,
      context
    );

    expect(result.name).toBe(args.name);
    expect(result.status).toBe(args.status);

    updateAutomationSpy.mockRestore();
  });

  test('Remove automations', async () => {
    const segment = await segmentFactory({});

    const mutation = `
      mutation automationsRemove($automationIds: [String]) {
        automationsRemove(automationIds: $automationIds)
      }
    `;

    const removeAutomationsSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'removeAutomations'
    );

    removeAutomationsSpy.mockImplementation(async () => {
      return { segmentIds: [segment._id] };
    });

    await graphqlRequest(
      mutation,
      'automationsRemove',
      { automationIds: [faker.random.uuid()] },
      context
    );

    expect(await Segments.find({ _id: segment._id }).countDocuments()).toBe(0);

    removeAutomationsSpy.mockRestore();
  });

  test('automations Add Note', async () => {
    const args = {
      automationId: faker.random.word(),
      triggerId: faker.random.word(),
      description: faker.random.word()
    };

    const mutation = `
      mutation automationsAddNote(${noteParamDefs}) {
        automationsAddNote(${noteParams}) {
          _id
          description
          triggerId
          actionId
          createdAt
        }
      }
    `;

    const addNoteSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'createAutomationNote'
    );

    addNoteSpy.mockImplementation(() => {
      return { ...args, createdAt: new Date(), createdBy: user._id };
    });

    const result = await graphqlRequest(
      mutation,
      'automationsAddNote',
      args,
      context
    );

    expect(args.triggerId).toBe(result.triggerId);
    expect(args.description).toBe(result.description);

    addNoteSpy.mockRestore();
  });

  test('automations Edit Note', async () => {
    const args = {
      _id: faker.random.word(),
      automationId: faker.random.word(),
      triggerId: faker.random.word(),
      description: faker.random.word()
    };

    const mutation = `
      mutation automationsEditNote($_id: String!, ${noteParamDefs}) {
        automationsEditNote(_id: $_id, ${noteParams}) {
          _id
          description
          triggerId
          actionId
          createdAt
        }
      }
    `;

    const getNoteSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'getAutomationNote'
    );

    getNoteSpy.mockImplementation(() => {
      return;
    });

    try {
      await graphqlRequest(mutation, 'automationsEditNote', args, context);
    } catch (e) {
      expect(e[0].message).toBe('Note not found');
    }

    getNoteSpy.mockImplementation(() => {
      return { ...args, createdAt: new Date(), createdBy: user._id };
    });

    const updateNoteSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'updateAutomationNote'
    );

    updateNoteSpy.mockImplementation(() => {
      return { ...args };
    });

    const result = await graphqlRequest(
      mutation,
      'automationsEditNote',
      args,
      context
    );

    expect(args.triggerId).toBe(result.triggerId);
    expect(args.description).toBe(result.description);

    updateNoteSpy.mockRestore();
    getNoteSpy.mockRestore();
  });

  test('automations Remove Note', async () => {
    const args = {
      _id: faker.random.word(),
      automationId: faker.random.word(),
      triggerId: faker.random.word(),
      description: faker.random.word()
    };

    const mutation = `
      mutation automationsRemoveNote($_id: String!) {
        automationsRemoveNote(_id: $_id) {
          _id
        }
      }
    `;

    const getNoteSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'getAutomationNote'
    );

    getNoteSpy.mockImplementation(() => {
      return;
    });

    try {
      await graphqlRequest(mutation, 'automationsRemoveNote', args, context);
    } catch (e) {
      expect(e[0].message).toBe('Note not found');
    }

    getNoteSpy.mockImplementation(() => {
      return { ...args, createdAt: new Date(), createdBy: user._id };
    });

    const removeNoteSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'removeAutomationNote'
    );

    removeNoteSpy.mockImplementation(() => {
      return {};
    });

    await graphqlRequest(mutation, 'automationsRemoveNote', args, context);

    removeNoteSpy.mockRestore();
    getNoteSpy.mockRestore();
  });

  test('automations Save As Template', async () => {
    const args = {
      _id: faker.random.word(),
      name: faker.random.word()
    };
    const mutation = `
      mutation automationsSaveAsTemplate($_id: String!, $name: String!) {
        automationsSaveAsTemplate(_id: $_id, name: $name) {
          _id
          name
          status
          createdAt
          updatedAt
          createdBy
          updatedBy
        }
      }
    `;

    const createAutomationSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'createAutomation'
    );

    createAutomationSpy.mockImplementation(() => {
      return {
        ...args,
        _id: faker.random.uuid(),
        createdAt: new Date(),
        updateAt: new Date(),
        createdBy: user._id,
        updatedBy: user._id
      };
    });

    const result = await graphqlRequest(
      mutation,
      'automationsSaveAsTemplate',
      args,
      context
    );

    expect(result.name).toBe(args.name);
    createAutomationSpy.mockRestore();
  });

  test('automations Create From Template', async () => {
    const args = {
      _id: faker.random.word()
    };
    const mutation = `
      mutation automationsCreateFromTemplate($_id: String!) {
        automationsCreateFromTemplate(_id: $_id) {
          _id
        }
      }
    `;

    try {
      await graphqlRequest(
        mutation,
        'automationsCreateFromTemplate',
        args,
        context
      );
    } catch (e) {
      expect(e[0].message).toBe('Not template');
    }

    getAutomationSpy.mockImplementation(() => {
      return { status: 'template' };
    });

    const createAutomationSpy = jest.spyOn(
      dataSources.AutomationsAPI,
      'createAutomation'
    );

    createAutomationSpy.mockImplementation(() => {
      return {
        ...args,
        _id: faker.random.uuid(),
        createdAt: new Date(),
        updateAt: new Date(),
        createdBy: user._id,
        updatedBy: user._id
      };
    });

    await graphqlRequest(
      mutation,
      'automationsCreateFromTemplate',
      args,
      context
    );

    createAutomationSpy.mockRestore();
  });
});
