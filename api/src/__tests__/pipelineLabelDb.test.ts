import {
  dealFactory,
  growthHackFactory,
  pipelineFactory,
  pipelineLabelFactory,
  taskFactory,
  ticketFactory,
  userFactory,
} from '../db/factories';
import { Deals, GrowthHacks, PipelineLabels, Pipelines, Tasks, Tickets } from '../db/models';
import { IPipelineLabelDocument } from '../db/models/definitions/pipelineLabels';

import { IPipelineDocument } from '../db/models/definitions/boards';
import { BOARD_TYPES } from '../db/models/definitions/constants';
import { IUserDocument } from '../db/models/definitions/users';
import './setup.ts';

describe('Test pipeline label model', () => {
  let pipelineLabel: IPipelineLabelDocument;
  let duplicatedPipelineLabel: IPipelineLabelDocument;
  let pipeline: IPipelineDocument;
  let duplicatedPipeline: IPipelineDocument;
  let user: IUserDocument;

  beforeEach(async () => {
    // Creating test data
    pipeline = await pipelineFactory({ type: BOARD_TYPES.DEAL });
    duplicatedPipeline = await pipelineFactory({ type: BOARD_TYPES.DEAL });

    pipelineLabel = await pipelineLabelFactory({ pipelineId: pipeline._id });
    duplicatedPipelineLabel = await pipelineLabelFactory({ pipelineId: duplicatedPipeline._id });

    user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await PipelineLabels.deleteMany({});
    await Pipelines.deleteMany({});
  });

  test('Get pipeline label', async () => {
    try {
      await PipelineLabels.getPipelineLabel('fakeId');
    } catch (e) {
      expect(e.message).toBe('Label not found');
    }

    const response = await PipelineLabels.getPipelineLabel(pipelineLabel._id);

    expect(response).toBeDefined();
  });

  // Create pipeline label
  test('Create pipeline label', async () => {
    const name = 'Name';
    const colorCode = 'colorCode';

    const created = await PipelineLabels.createPipelineLabel({
      name,
      colorCode,
      pipelineId: pipeline._id,
      createdBy: user._id,
    });

    expect(created).toBeDefined();
    expect(created.name).toEqual(name);
    expect(created.colorCode).toEqual(colorCode);
    expect(created.pipelineId).toEqual(pipeline._id);
  });

  test('Update pipeline label (Error: Label duplicated)', async () => {
    const duplicatedLabel = await pipelineLabelFactory();

    try {
      await PipelineLabels.updatePipelineLabel(pipelineLabel._id, {
        name: duplicatedLabel.name,
        colorCode: duplicatedLabel.colorCode,
        pipelineId: duplicatedLabel.pipelineId,
      });
    } catch (e) {
      expect(e.message).toBe('Label duplicated');
    }
  });

  test('Update pipeline label', async () => {
    const name = 'Updated name';
    const colorCode = 'Updated colorCode';
    const pipelineId = 'Updated pipelineId';

    const updated = await PipelineLabels.updatePipelineLabel(pipelineLabel._id, {
      name,
      colorCode,
      pipelineId,
    });

    expect(updated).toBeDefined();
    expect(updated.name).toEqual(name);
    expect(updated.colorCode).toEqual(colorCode);
    expect(updated.pipelineId).toEqual(pipelineId);
  });

  // Test pipeline label
  test('Pipeline label (Label duplicated)', async () => {
    try {
      await PipelineLabels.createPipelineLabel({
        name: duplicatedPipelineLabel.name,
        colorCode: duplicatedPipelineLabel.colorCode,
        pipelineId: duplicatedPipeline._id,
        createdBy: user._id,
      });
    } catch (e) {
      expect(e.message).toBe('Label duplicated');
    }
  });

  test('Remove pipeline label', async () => {
    const dealPipeline = await pipelineFactory({ type: 'deal' });
    const taskPipeline = await pipelineFactory({ type: 'task' });
    const ticketPipeline = await pipelineFactory({ type: 'ticket' });
    const growthHackPipeline = await pipelineFactory({ type: 'growthHack' });

    const dealLabel = await pipelineLabelFactory({ type: 'deal', pipelineId: dealPipeline._id });
    const taskLabel = await pipelineLabelFactory({ type: 'task', pipelineId: taskPipeline._id });
    const ticketLabel = await pipelineLabelFactory({ type: 'ticket', pipelineId: ticketPipeline._id });
    const growthHackLabel = await pipelineLabelFactory({ type: 'growthHack', pipelineId: growthHackPipeline._id });

    await dealFactory({ labelIds: [dealLabel._id] });
    await taskFactory({ labelIds: [taskLabel._id] });
    await ticketFactory({ labelIds: [ticketLabel._id] });
    await growthHackFactory({ labelIds: [growthHackLabel._id] });

    await PipelineLabels.removePipelineLabel(dealLabel._id);

    expect(await Deals.find({ labelIds: [dealLabel._id] }).countDocuments()).toBe(0);

    await PipelineLabels.removePipelineLabel(taskLabel._id);

    expect(await Tasks.find({ labelIds: [taskLabel._id] }).countDocuments()).toBe(0);

    await PipelineLabels.removePipelineLabel(ticketLabel._id);

    expect(await Tickets.find({ labelIds: [ticketLabel._id] }).countDocuments()).toBe(0);

    await PipelineLabels.removePipelineLabel(growthHackLabel._id);

    expect(await GrowthHacks.find({ labelIds: [growthHackLabel._id] }).countDocuments()).toBe(0);
  });

  test('Remove pipeline label not found', async () => {
    expect.assertions(1);

    const fakeId = 'fakeId';

    try {
      await PipelineLabels.removePipelineLabel(fakeId);
    } catch (e) {
      expect(e.message).toEqual('Label not found');
    }
  });

  test('Pipeline labels label', async () => {
    const deal = await dealFactory();

    const targetId = deal._id;

    const pipelineLabelTwo = await pipelineLabelFactory();

    const labelIds = [pipelineLabel._id, pipelineLabelTwo._id];

    // add label to specific object
    await PipelineLabels.labelsLabel(pipeline._id, targetId, labelIds);

    const obj = await Deals.getDeal(deal._id);

    const updatedLabelIds = obj.labelIds || [];

    expect(updatedLabelIds[0]).toEqual(pipelineLabel.id);
    expect(updatedLabelIds[1]).toEqual(pipelineLabelTwo.id);
    expect(updatedLabelIds.length).toEqual(2);
  });

  test('Pipeline labels label (Error: Label not found)', async () => {
    const deal = await dealFactory();
    const targetId = deal._id;

    const labelIds = ['fakeId'];

    try {
      // add label to specific object
      await PipelineLabels.labelsLabel(pipeline._id, targetId, labelIds);
    } catch (e) {
      expect(e.message).toBe('Label not found');
    }
  });
});
