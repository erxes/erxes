import { graphqlRequest } from '../db/connection';
import {
  clientPortalFactory,
  customerFactory,
  pipelineFactory,
  stageFactory,
  taskFactory,
  ticketFactory
} from '../db/factories';
import {
  Boards,
  ClientPortals,
  Companies,
  Customers,
  Pipelines,
  Stages,
  Tasks
} from '../db/models';

import './setup.ts';

describe('Client portal', () => {
  afterEach(async () => {
    // Clearing test data
    await ClientPortals.deleteMany({});
    await Customers.deleteMany({});
    await Companies.deleteMany({});
    await Boards.deleteMany({});
    await Pipelines.deleteMany({});
    await Stages.deleteMany({});
    await Tasks.deleteMany({});
  });

  test('Create client portal', async () => {
    const args = { name: 'deal board' };

    const mutation = `
      mutation clientPortalConfigUpdate($_id: String, $name: String) {
        clientPortalConfigUpdate(_id: $_id, name: $name) {
          _id
          name
        }
      }
    `;

    let response = await graphqlRequest(
      mutation,
      'clientPortalConfigUpdate',
      args
    );

    expect(response.name).toEqual(args.name);

    // update
    response = await graphqlRequest(mutation, 'clientPortalConfigUpdate', {
      _id: response._id,
      name: 'updated'
    });

    expect(response.name).toEqual('updated');
  });

  test('Remove client portal', async () => {
    const portal = await clientPortalFactory({});

    const mutation = `
      mutation clientPortalRemove($_id: String!) {
        clientPortalRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'clientPortalRemove', { _id: portal._id });

    expect(await ClientPortals.find().count()).toBe(0);
  });

  test('Create customer', async () => {
    const portal = await clientPortalFactory({});

    const mutation = `
      mutation clientPortalCreateCustomer($configId: String!, $email: String!, $firstName: String!, $lastName: String!) {
        clientPortalCreateCustomer(configId: $configId, email: $email, firstName: $firstName, lastName: $lastName) {
          _id
	  primaryEmail
        }
      }
    `;

    const response = await graphqlRequest(
      mutation,
      'clientPortalCreateCustomer',
      {
        configId: portal._id,
        email: 'test@yahoo.com',
        firstName: 'name',
        lastName: 'name'
      }
    );

    expect(response.primaryEmail).toEqual('test@yahoo.com');
  });

  test('Create company', async () => {
    const portal = await clientPortalFactory({});

    const mutation = `
      mutation clientPortalCreateCompany($configId: String!, $email: String!, $companyName: String!) {
        clientPortalCreateCompany(configId: $configId, email: $email, companyName: $companyName) {
          _id
	  primaryEmail
        }
      }
    `;

    const response = await graphqlRequest(
      mutation,
      'clientPortalCreateCompany',
      { configId: portal._id, email: 'test@yahoo.com', companyName: 'name' }
    );

    expect(response.primaryEmail).toEqual('test@yahoo.com');
  });

  test('Create card', async () => {
    expect.assertions(2);

    const stage = await stageFactory({});

    const mutation = `
      mutation clientPortalCreateCard($type: String!, $email: String!, $stageId: String!, $subject: String!) {
        clientPortalCreateCard(type: $type, email: $email, stageId: $stageId, subject: $subject) {
          _id
	  name
        }
      }
    `;

    const args = {
      type: 'task',
      stageId: stage._id,
      email: 'test@yahoo.com',
      subject: 'subject'
    };

    try {
      await graphqlRequest(mutation, 'clientPortalCreateCard', args);
    } catch (e) {
      expect(e[0]).toBeDefined();
    }

    await customerFactory({ primaryEmail: 'test@yahoo.com' });

    const response = await graphqlRequest(
      mutation,
      'clientPortalCreateCard',
      args
    );

    expect(response.name).toBe(args.subject);
  });

  test('get configs', async () => {
    await clientPortalFactory({});

    let query = `
      query clientPortalGetConfigs {
        clientPortalGetConfigs {
          _id
	  name
        }
      }
    `;

    let response = await graphqlRequest(query, 'clientPortalGetConfigs');

    expect(response.length).toBe(1);

    query = `
      query clientPortalConfigsTotalCount {
        clientPortalConfigsTotalCount
      }
    `;

    response = await graphqlRequest(query, 'clientPortalConfigsTotalCount');

    expect(response).toBe(1);

    query = `
      query clientPortalGetLast {
	clientPortalGetLast {
	  _id
	}
      }
    `;

    await graphqlRequest(query, 'clientPortalGetLast');

    query = `
      query clientPortalGetConfig($_id: String!) {
	clientPortalGetConfig(_id: $_id) {
	  _id
	}
      }
    `;

    try {
      await graphqlRequest(query, 'clientPortalGetConfig', { _id: '_id' });
    } catch (e) {
      expect(e[0]).toBeDefined();
    }

    const pipeline = await pipelineFactory({});

    query = `
      query clientPortalGetTaskStages($taskPublicPipelineId: String!) {
	clientPortalGetTaskStages(taskPublicPipelineId: $taskPublicPipelineId) {
	  _id
	}
      }
    `;

    await graphqlRequest(query, 'clientPortalGetTaskStages', {
      taskPublicPipelineId: pipeline._id
    });

    const stage = await stageFactory({});

    query = `
      query clientPortalGetTasks($stageId: String!) {
	clientPortalGetTasks(stageId: $stageId) {
	  _id
	}
      }
    `;

    await graphqlRequest(query, 'clientPortalGetTasks', { stageId: stage._id });

    const task = await taskFactory({});

    query = `
      query clientPortalTask($_id: String!) {
	clientPortalTask(_id: $_id) {
	  _id
	}
      }
    `;

    await graphqlRequest(query, 'clientPortalTask', { _id: task._id });

    let ticket = await ticketFactory({});

    query = `
      query clientPortalTicket($_id: String!) {
	clientPortalTicket(_id: $_id) {
	  _id
	}
      }
    `;

    await graphqlRequest(query, 'clientPortalTicket', { _id: ticket._id });

    query = `
      query clientPortalTickets($email: String!) {
	clientPortalTickets(email: $email) {
	  _id
	}
      }
    `;

    response = await graphqlRequest(query, 'clientPortalTickets', {
      email: 'test@yahoo.com'
    });
    expect(response.length).toBe(0);

    const customer = await customerFactory({ primaryEmail: 'test@yahoo.com' });
    ticket = await ticketFactory({ userId: customer._id });
    response = await graphqlRequest(query, 'clientPortalTickets', {
      email: 'test@yahoo.com'
    });
    expect(response.length).toBe(1);
  });

  test('getConfig', async () => {
    expect.assertions(1);

    try {
      await ClientPortals.getConfig('_id');
    } catch (e) {
      expect(e.message).toBe('Config not found');
    }
  });
});
