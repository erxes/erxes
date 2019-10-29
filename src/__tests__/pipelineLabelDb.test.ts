import { dealFactory, pipelineFactory, pipelineLabelFactory, userFactory } from '../db/factories';
import { Deals, PipelineLabels, Pipelines } from '../db/models';
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
    await dealFactory({ labelIds: [pipelineLabel._id] });

    let count = await Deals.findOne({ labelIds: { $in: [pipelineLabel._id] } }).countDocuments();

    expect(count).toBe(1);

    const isDeleted = await PipelineLabels.removePipelineLabel(pipelineLabel._id);

    count = await Deals.findOne({ labelIds: { $in: [pipelineLabel._id] } }).countDocuments();

    expect(count).toBe(0);
    expect(isDeleted).toBeTruthy();
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
});
