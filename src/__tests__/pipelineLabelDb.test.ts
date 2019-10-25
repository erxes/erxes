import { dealFactory, pipelineFactory, pipelineLabelFactory, userFactory } from '../db/factories';
import { Deals, PipelineLabels, Pipelines } from '../db/models';
import { IPipelineLabelDocument } from '../db/models/definitions/pipelineLabels';

import { IPipelineDocument } from '../db/models/definitions/boards';
import { IUserDocument } from '../db/models/definitions/users';
import './setup.ts';

describe('Test pipeline label model', () => {
  let pipelineLabel: IPipelineLabelDocument;
  let duplicatedPipelineLabel: IPipelineLabelDocument;
  let pipeline: IPipelineDocument;
  let user: IUserDocument;

  beforeEach(async () => {
    // Creating test data
    pipeline = await pipelineFactory();
    pipelineLabel = await pipelineLabelFactory();
    duplicatedPipelineLabel = await pipelineLabelFactory({ pipelineId: pipeline._id });
    user = await userFactory();
  });

  afterEach(async () => {
    // Clearing test data
    await PipelineLabels.deleteMany({});
    await Pipelines.deleteMany({});
  });

  // Create pipeline label
  test('Create pipeline label', async () => {
    const created = await PipelineLabels.createPipelineLabel({
      name: pipelineLabel.name,
      type: pipelineLabel.type,
      colorCode: pipelineLabel.colorCode,
      pipelineId: pipeline._id,
      createdBy: user._id,
    });

    expect(created).toBeDefined();
    expect(created.name).toEqual(pipelineLabel.name);
    expect(created.type).toEqual(pipelineLabel.type);
    expect(created.colorCode).toEqual(pipelineLabel.colorCode);
    expect(created.pipelineId).toEqual(pipeline._id);
  });

  test('Update pipeline label', async () => {
    const name = 'Updated name';
    const colorCode = 'Updated colorCode';
    const type = 'Updated type';
    const pipelineId = 'Updated pipelineId';

    const updated = await PipelineLabels.updatePipelineLabel(pipelineLabel._id, {
      name,
      colorCode,
      type,
      pipelineId,
    });

    expect(updated).toBeDefined();
    expect(updated.name).toEqual(name);
    expect(updated.type).toEqual(type);
    expect(updated.colorCode).toEqual(colorCode);
    expect(updated.pipelineId).toEqual(pipelineId);
  });

  // Test pipeline label
  test('Pipeline label (Label duplicated)', async () => {
    try {
      await PipelineLabels.createPipelineLabel({
        name: duplicatedPipelineLabel.name,
        type: duplicatedPipelineLabel.type,
        colorCode: duplicatedPipelineLabel.colorCode,
        pipelineId: pipeline._id,
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
    const type = 'deal';

    const deal = await dealFactory();

    const targetId = deal._id;

    const pipelineLabelTwo = await pipelineLabelFactory();

    const labelIds = [pipelineLabel._id, pipelineLabelTwo._id];

    // add label to specific object
    await PipelineLabels.labelsLabel(type, targetId, labelIds);

    const obj = await Deals.findOne({ _id: deal._id });

    if (!obj || !obj.labelIds) {
      throw new Error('Deal not found');
    }

    expect(obj.labelIds[0]).toEqual(pipelineLabel.id);
    expect(obj.labelIds[1]).toEqual(pipelineLabelTwo.id);
    expect(obj.labelIds.length).toEqual(2);
  });
});
