import Automations, { ReEnrollmentRule } from "../models/Automations";
import { Executions } from "../models/Executions";
import { automationFactory } from "../models/factories";
import { calculateExecution, receiveTrigger, reset, tags } from "../utils";
import "./setup";

describe('getOrCreateExecution', () => {
  beforeEach(async () => {
    await Automations.remove({});
    await Executions.remove({});
    reset();
  })

  test("consecutive", async (done) => {
    const automationId = '_id';
    const triggerId = '_id';
    const reEnrollmentRules: ReEnrollmentRule[] = [{ property: 'amount' }, { property: 'title' }];
    const target = { _id: 'dealId', amount: 100, title: 'title', description: 'description' };

    await calculateExecution({ automationId, triggerId, reEnrollmentRules, target });

    // new entry must be inserted
    const execution = await Executions.findOne();

    expect(execution.automationId).toBe(automationId);
    expect(execution.triggerId).toBe(triggerId);
    expect(execution.targetId).toBe(target._id);
    expect(execution.target).toEqual(target);

    // since data is same no entry must be inserted
    await calculateExecution({ automationId, triggerId, reEnrollmentRules, target });

    expect(await Executions.find().count()).toBe(1);


    // amount is changed therefore new entry must be inserted
    target.amount = 200;
    await calculateExecution({ automationId, triggerId, reEnrollmentRules, target });

    expect(await Executions.find().count()).toBe(2);

    const secondExecution = await Executions.findOne({ _id: { $ne: execution._id }});

    expect(secondExecution.target.amount).toBe(200);

    // changing title field
    target.title = 'changed title';
    await calculateExecution({ automationId, triggerId, reEnrollmentRules, target });

    expect(await Executions.find().count()).toBe(3);

    const third = await Executions.findOne({ _id: { $nin: [execution._id, secondExecution._id] }});
    expect(third.target.title).toBe('changed title');

    // changing non important field
    target.description = 'changed decription';
    await calculateExecution({ automationId, triggerId, reEnrollmentRules, target });

    expect(await Executions.find().count()).toBe(3);

    done();
  });
});

const triggers = [
  {
    id: "1",
    type: "deal",
    config: {
      segmentId: "segmentId",
      reEnrollmentRules: [
        { property: "amount", description: "Amount is set" },
      ],
    },
    actionId: "1",
  },
];

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
      status: 'active',
      triggers,
      actions: [
        {
          id: "1",
          type: "ADD_TAGS",
          config: { names: ["t1", "t2"] },
          nextActionId: "2",
        },
        {
          id: "2",
          type: "IF",
          config: {
            segmentId: "segmentId",
            yes: "3",
          },
        },
        {
          id: "3",
          type: "REMOVE_TAGS",
          config: {
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
    await receiveTrigger({ type: "deal", target: { _id: 'dealId1', amount: 100 } });

    expect(tags).toEqual(["t2"]);
    expect(await Automations.find().count()).toBe(1);
    expect(await Executions.find().count()).toBe(1);

    const execution = await Executions.findOne();

    expect(execution.triggerId).toBe('1');
    expect(execution.waitingActionId).toBe(null);
    expect(execution.lastCheckedWaitDate).toBe(null);

    done();
  });

  test("if no", async (done) => {
    await receiveTrigger({ type: "deal", target: { _id: "dealId2" } });

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
      status: 'active',
      triggers,
      actions: [
        {
          id: "1",
          type: "ADD_TAGS",
          config: { names: ["t1", "t2"] },
          nextActionId: "2",
        },
        {
          id: "2",
          type: "WAIT",
          config: {
            period: '1d',
          },
          nextActionId: "3",
        },
        {
          id: "3",
          type: "IF",
          config: {
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
    await receiveTrigger({ type: "deal", target: { _id: "dealId1" } });

    expect(tags).toEqual(["t1", "t2"]);

    const execution = await Executions.findOne();

    expect(execution.waitingActionId).toBe('2');
    expect(execution.lastCheckedWaitDate).not.toBe(null);

    done();
  });
});

// describe('executeActions (placeholder)', () => {
//   beforeEach(async () => {
//     /*
//         form submit (trigger)
//               |
//         create task (action)
//               |
//         create deal (action)
//     */
//     await automationFactory({
//       name: "1",
//       status: 'active',
//       triggers:
//         [{
//           id: '1',
//           type: "formSubmit",
//           actionId: '1',
//           config: {
//             fields: [
//               { fieldName: 'field_id1', label: 'Product name' },
//               { fieldName: 'field_id2', label: 'Price' },
//             ]
//           },
//         }],

//       actions: [
//         {
//           id: "1",
//           type: "ADD_TASK",
//           config: { description: 'Customer"s first name is {{ firstName }}, lastName is {{ lastName }}' },
//           nextActionId: "2",
//         },
//         {
//           id: "2",
//           type: "ADD_DEAL",
//           config: { title: "title {{ field_1 }}", description: 'Price: {{ field_2 }} shvv' },
//         },
//       ],
//     });
//   });

//   afterEach(async () => {
//     await Automations.remove({});
//     await Executions.remove({});
//     reset();
//   })

//   test("check deal", async (done) => {
//     await receiveTrigger({
//       type: "formSubmit", targetId: "submission1", data: {
//         "field_1": "Hoodie",
//         "field_2": 1000
//       }
//     });

//     expect(deals.length).toBe(1);

//     const [deal] = deals;

//     expect(deal.title).toBe('title Hoodie')
//     expect(deal.description).toBe('Price: 1000 shvv')

//     done();
//   });
// });
