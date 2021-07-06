import Automations from "../models/Automations";
import { Executions } from "../models/Executions";
import { automationFactory } from "../models/factories";
import { receiveTrigger, resetTags, tags } from "../utils";
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
      triggers: ["websiteVisited"],
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
    resetTags();
  })

  test("if yes", async (done) => {
    await receiveTrigger({ trigger: "websiteVisited", targetId: "customerId1" });

    expect(tags).toEqual(["t2"]);
    expect(await Automations.find().count()).toBe(1);
    expect(await Executions.find().count()).toBe(1);

    const execution = await Executions.findOne();

    expect(execution.trigger).toBe('websiteVisited');
    expect(execution.waitingActionId).toBe(null);
    expect(execution.lastCheckedWaitDate).toBe(null);

    done();
  });

  test("if no", async (done) => {
    await receiveTrigger({ trigger: "websiteVisited", targetId: "customerId2" });

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
      triggers: ["websiteVisited"],
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
    resetTags();
  })

  test("wait", async (done) => {
    await receiveTrigger({ trigger: "websiteVisited", targetId: "customerId1" });

    expect(tags).toEqual(["t1", "t2"]);

    const execution = await Executions.findOne();

    expect(execution.waitingActionId).toBe('2');
    expect(execution.lastCheckedWaitDate).not.toBe(null);

    done();
  });
});