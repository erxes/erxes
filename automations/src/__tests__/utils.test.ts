import Automations from "../models/Automations";
import { Executions } from "../models/Executions";
import { automationFactory } from "../models/factories";
import { deals, receiveTrigger, reset, tags, tasks } from "../utils";
import "./setup";

describe('executeActions (if)', () => {
  beforeEach(async () => {
    /*
          websiteVisited (trigger)
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
      triggers: [{ id: "1", type: "websiteVisited" }],
      actions: [
        {
          id: "1",
          type: "ADD_TAGS",
          data: { names: ["t1", "t2"] },
          nextActionId: "2",
        },
        {
          id: "2",
          prevActionId: "1",
          type: "IF",
          data: {
            segmentId: "segmentId",
            yes: "3",
          },
        },
        {
          id: "3",
          prevActionId: "2",
          type: "REMOVE_TAGS",
          data: {
            names: ["t1"],
          },
        },
      ],
    });
  });

  afterEach(async () => {
    await Automations.remove({});
    await Executions.remove({});
    reset();
  })

  test("if yes", async (done) => {
    await receiveTrigger({ triggerType: "websiteVisited", targetId: "customerId1" });

    expect(tags).toEqual(["t2"]);
    expect(await Automations.find().count()).toBe(1);
    expect(await Executions.find().count()).toBe(1);

    const execution = await Executions.findOne();

    expect(execution.triggerType).toBe('websiteVisited');
    expect(execution.waitingActionId).toBe(null);
    expect(execution.lastCheckedWaitDate).toBe(null);

    done();
  });

  test("if no", async (done) => {
    await receiveTrigger({ triggerType: "websiteVisited", targetId: "customerId2" });

    expect(tags).toEqual(["t1", "t2"]);

    done();
  });
});

describe('executeActions (wait)', () => {
  beforeEach(async () => {
    /*
          websiteVisited (trigger)
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
      triggers: [{ id: "1", type: "websiteVisited" }],
      actions: [
        {
          id: "1",
          type: "ADD_TAGS",
          data: { names: ["t1", "t2"] },
          nextActionId: "2",
        },
        {
          id: "2",
          prevActionId: "1",
          type: "WAIT",
          data: {
            period: '1d',
          },
          nextActionId: "3",
        },
        {
          id: "3",
          prevActionId: "2",
          type: "IF",
          data: {
            segmentId: "segmentId",
          },
        },
      ],
    });
  });

  afterEach(async () => {
    await Automations.remove({});
    await Executions.remove({});
    reset();
  })

  test("wait", async (done) => {
    await receiveTrigger({ triggerType: "websiteVisited", targetId: "customerId1" });

    expect(tags).toEqual(["t1", "t2"]);

    const execution = await Executions.findOne();

    expect(execution.waitingActionId).toBe('2');
    expect(execution.lastCheckedWaitDate).not.toBe(null);

    done();
  });
});

describe('executeActions (placeholder)', () => {
  beforeEach(async () => {
    /*
        form submit (trigger)
              |
        create task (action)
              |
        create deal (action)
    */
    await automationFactory({
      name: "1",
      triggers: [
        {
          id: "1",
          type: "formSubmit",
          data: {
            fields: [
              { fieldName: 'field_id1', label: 'Product name' },
              { fieldName: 'field_id2', label: 'Price' },
            ]
          },
        },
        {
          id: "2",
          type: "createCustomer",
          data: {
            fields: [
              { fieldName: 'firstName', label: 'First name' },
              { fieldName: 'lastName', label: 'Last name' },
            ]
          },
        },
      ],

      actions: [
        {
          id: "1",
          type: "ADD_TASK",
          data: { description: 'Customer"s first name is {{ firstName }}, lastName is {{ lastName }}' },
          nextActionId: "2",
        },
        {
          id: "2",
          prevActionId: "1",
          type: "ADD_DEAL",
          data: { title: "title {{ field_1 }}", description: 'Price: {{ field_2 }} shvv' },
        },
      ],
    });
  });

  afterEach(async () => {
    await Automations.remove({});
    await Executions.remove({});
    reset();
  })

  test("check deal", async (done) => {
    await receiveTrigger({ triggerType: "formSubmit", targetId: "submission1", data: {
      "field_1": "Hoodie",
      "field_2": 1000
    } });

    expect(deals.length).toBe(1);

    const [deal] = deals;

    expect(deal.title).toBe('title Hoodie')
    expect(deal.description).toBe('Price: 1000 shvv')

    done();
  });

  test("check task", async (done) => {
    await receiveTrigger({ triggerType: "createCustomer", targetId: "customer1", data: {
      "firstName": "Dombo",
      "lastName": "Gombo"
    } });

    expect(tasks.length).toBe(1);

    const [task] = tasks;

    expect(task.description).toBe('Customer"s first name is Dombo, lastName is Gombo')

    done();
  });
});