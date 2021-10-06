import * as sinon from 'sinon';
import Automations, { ITrigger } from "../models/Automations";
import { Executions } from "../models/Executions";
import { automationFactory } from "../models/factories";
import { calculateExecution, receiveTrigger } from "../utils";
import * as utils from "../utils";
import "./setup";
import { ACTIONS } from '../constants';
import * as messageBroker from '../messageBroker'

describe('getOrCreateExecution', () => {
  beforeEach(async () => {
    await Automations.remove({});
    await Executions.remove({});
  })

  test("consecutive", async (done) => {
    const automationId = '_id';
    const fakeTrigger: ITrigger = {
      id: '_id',
      type: 'deal',
      config: {
        contentId: '_id',
        reEnrollment: true,
        reEnrollmentRules: ['amount', 'title'],
      }
    }

    const target = { _id: 'dealId', amount: 100, title: 'title', description: 'description' };

    const mock = sinon.stub(utils, 'isInSegment').callsFake(() => {
      return Promise.resolve(true);
    });

    await calculateExecution({ automationId, trigger: fakeTrigger, target });

    // new entry must be inserted
    const execution = await Executions.findOne();

    expect(execution.automationId).toBe(automationId);
    expect(execution.triggerId).toBe(fakeTrigger.id);
    expect(execution.targetId).toBe(target._id);
    expect(execution.target).toEqual(target);

    // since data is same no entry must be inserted
    await calculateExecution({ automationId, trigger: fakeTrigger, target });

    expect(await Executions.find().count()).toBe(1);

    // amount is changed therefore new entry must be inserted
    target.amount = 200;
    await calculateExecution({ automationId, trigger: fakeTrigger, target });

    expect(await Executions.find().count()).toBe(2);

    const secondExecution = await Executions.findOne({ _id: { $ne: execution._id } });

    expect(secondExecution.target.amount).toBe(200);

    // changing title field
    target.title = 'changed title';
    await calculateExecution({ automationId, trigger: fakeTrigger, target });

    expect(await Executions.find().count()).toBe(3);

    const third = await Executions.findOne({ _id: { $nin: [execution._id, secondExecution._id] } });
    expect(third.target.title).toBe('changed title');

    // changing non important field
    target.description = 'changed decription';
    await calculateExecution({ automationId, trigger: fakeTrigger, target });

    expect(await Executions.find().count()).toBe(3);

    mock.restore();

    done();
  });
});

const triggers = [
  {
    id: "1",
    type: "deal",
    config: {
      contentId: "segmentId",
      reEnrollment: true,
      reEnrollmentRules: ["amount", "Amount"],
    },
    actionId: "1",
  },
];

describe('executeActions (if)', () => {
  beforeEach(async () => {
    /*
          deal created (trigger)
              |
            Add tag
              |
        IF (customer has name)
              |
              / \
            yes  no
            |
        Remove tag
    */

    await automationFactory({
      name: "1",
      status: 'active',
      triggers,
      actions: [
        {
          id: "1",
          type: ACTIONS.CREATE_DEAL,
          config: { name: "d1", stageId: 'stage' },
          nextActionId: "2",
        },
        {
          id: "2",
          type: ACTIONS.IF,
          config: {
            segmentId: "segmentIdd",
            yes: "3",
          },
        },
        {
          id: "3",
          type: ACTIONS.CREATE_TASK,
          config: {
            name: "t1",
            stageId: 'stage',
          },
        },
      ],
    });
  });

  afterEach(async () => {
    await Automations.remove({});
    await Executions.remove({});
  })

  test("if yes", async (done) => {
    const createItem = sinon.stub(messageBroker, 'sendRPCMessage').callsFake((_action, data) => {
      return { name: data.name }
    })
    const mock = sinon.stub(utils, 'isInSegment').callsFake(() => {
      return Promise.resolve(true);
    });

    await receiveTrigger({ type: "deal", targets: [{ _id: 'dealId1', amount: 100 }] });

    expect(await Automations.find().count()).toBe(1);
    expect(await Executions.find().count()).toBe(1);

    const execution = await Executions.findOne();

    expect(execution.triggerId).toBe('1');
    expect(execution.actions.length).toBe(3);
    expect(execution.actions[0].result.name).toBe('d1');
    expect(execution.actions[1].result.condition).toBe(true);
    expect(execution.actions[2].result.name).toBe('t1');
    expect(execution.status).toContain('complete');
    expect(execution.waitingActionId).toBeUndefined();
    expect(execution.startWaitingDate).toBeUndefined();

    mock.restore();
    createItem.restore();

    done();
  });

  test("if no", async (done) => {
    const createItem = sinon.stub(messageBroker, 'sendRPCMessage').callsFake((_action, data) => {
      return { name: data.name }
    })
    const mock = sinon.stub(utils, 'isInSegment').callsFake((segmentId) => {
      if (segmentId === 'segmentId') {
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    });

    await receiveTrigger({ type: "deal", targets: [{ _id: "dealId2" }] });

    expect(await Automations.find().count()).toBe(1);
    expect(await Executions.find().count()).toBe(1);

    const execution = await Executions.findOne();

    expect(execution.triggerId).toBe('1');
    expect(execution.actions.length).toBe(2);
    expect(execution.actions[0].result.name).toBe('d1');
    expect(execution.actions[1].result.condition).toBe(false);
    expect(execution.status).toContain('complete');
    expect(execution.waitingActionId).toBeUndefined();
    expect(execution.startWaitingDate).toBeUndefined();

    mock.restore();
    createItem.restore();

    done();
  });
});

describe('executeActions (wait)', () => {
  beforeEach(async () => {
    /*
          deal updated (trigger)
              |
            Add tag
              |
            Wait (1 day)
              |
        IF (customer has name)
              |
              / \
            yes  no
    */
    await automationFactory({
      name: "1",
      status: 'active',
      triggers,
      actions: [
        {
          id: "1",
          type: ACTIONS.CREATE_TICKET,
          config: { name: "t1" },
          nextActionId: "2",
        },
        {
          id: "2",
          type: ACTIONS.WAIT,
          config: {
            period: '1d',
          },
          nextActionId: "3",
        },
        {
          id: "3",
          type: ACTIONS.IF,
          config: {
            contentId: "segmentId",
          },
        },
      ],
    });
  });

  afterEach(async () => {
    await Automations.remove({});
    await Executions.remove({});
  })

  test("wait", async (done) => {
    const createItem = sinon.stub(messageBroker, 'sendRPCMessage').callsFake((_action, data) => {
      return { name: data.name }
    })
    const mock = sinon.stub(utils, 'isInSegment').callsFake(() => {
      return Promise.resolve(true);
    });

    await receiveTrigger({ type: "deal", targets: [{ _id: 'dealId1', amount: 100 }] });

    const execution = await Executions.findOne();

    expect(execution.triggerId).toBe('1');
    expect(execution.actions.length).toBe(2);
    expect(execution.actions[0].result.name).toBe('t1');
    expect(execution.actions[1].result).toBe(undefined);
    expect(execution.status).toContain('waiting');

    expect(execution.waitingActionId).toBe('2');
    expect(execution.startWaitingDate).not.toBe(null);

    mock.restore();
    createItem.restore();


    done();
  });
});

describe('executeActions (placeholder)', () => {
  beforeEach(async () => {
    await automationFactory({
      name: "1",
      status: 'active',
      triggers:
        [{
          id: '1',
          type: "customer",
          actionId: '1',
          config: {
            contentId: 'segmentId',
            reEnrollment: true,
            reEnrollmentRules: ['firstName']
          },
        }],

      actions: [
        {
          id: "1",
          type: "createDeal",
          config: { cardName: "title {{ firstName }}", description: 'Custom fields data: {{ customFieldsData.fieldId }}' },
        },
      ],
    });
  });

  afterEach(async () => {
    await Automations.remove({});
    await Executions.remove({});
  })

  test("check deal", async (done) => {
    const customer = {
      _id: '_id',
      firstName: 'firstName',
      customFieldsData: [
        { field: 'fieldId', value: 'custom value' }
      ]
    }

    const createItem = sinon.stub(messageBroker, 'sendRPCMessage').callsFake((_action, data) => {
      expect(data.description).toBe('Custom fields data: custom value')
      return { name: data.cardName }
    })
    const mock = sinon.stub(utils, 'isInSegment').callsFake(() => {
      return Promise.resolve(true);
    });

    await receiveTrigger({ type: "customer", targets: [customer] });

    const execution = await Executions.findOne();

    expect(execution.triggerId).toBe('1');
    expect(execution.actions.length).toBe(1);
    expect(execution.actions[0].result.name).toBe(`title ${customer.firstName}`);
    expect(execution.status).toContain('complete');
    expect(execution.waitingActionId).toBeUndefined();
    expect(execution.startWaitingDate).toBeUndefined();

    mock.restore();
    createItem.restore();

    done();
  });
});
