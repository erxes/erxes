import {
  boardFactory,
  companyFactory,
  customerFactory,
  dealFactory,
  pipelineFactory,
  stageFactory,
  userFactory,
} from '../db/factories';
import { Boards, Deals, Pipelines, Stages } from '../db/models';
import { IBoardDocument, IPipelineDocument, IStageDocument } from '../db/models/definitions/boards';
import { IDealDocument } from '../db/models/definitions/deals';
import { IUserDocument } from '../db/models/definitions/users';

import './setup.ts';

describe('Test deals model', () => {
  let board: IBoardDocument;
  let pipeline: IPipelineDocument;
  let stage: IStageDocument;
  let deal: IDealDocument;
  let user: IUserDocument;

  beforeEach(async () => {
    // Creating test data
    board = await boardFactory();
    pipeline = await pipelineFactory({ boardId: board._id });
    stage = await stageFactory({ pipelineId: pipeline._id });
    deal = await dealFactory({ stageId: stage._id });
    user = await userFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Boards.deleteMany({});
    await Pipelines.deleteMany({});
    await Stages.deleteMany({});
    await Deals.deleteMany({});
  });

  // Test deal
  test('Create deal', async () => {
    const createdDeal = await Deals.createDeal({
      stageId: deal.stageId,
      userId: user._id,
    });

    expect(createdDeal).toBeDefined();
    expect(createdDeal.stageId).toEqual(stage._id);
    expect(createdDeal.createdAt).toEqual(deal.createdAt);
    expect(createdDeal.userId).toEqual(user._id);
  });

  test('Update deal', async () => {
    const dealStageId = 'fakeId';
    const updatedDeal = await Deals.updateDeal(deal._id, {
      stageId: dealStageId,
    });

    expect(updatedDeal).toBeDefined();
    expect(updatedDeal.stageId).toEqual(dealStageId);
    expect(updatedDeal.closeDate).toEqual(deal.closeDate);
  });

  test('Update deal orders', async () => {
    const dealToOrder = await dealFactory({});

    const [updatedDeal, updatedDealToOrder] = await Deals.updateOrder(stage._id, [
      { _id: deal._id, order: 9 },
      { _id: dealToOrder._id, order: 3 },
    ]);

    expect(updatedDeal.stageId).toBe(stage._id);
    expect(updatedDeal.order).toBe(3);
    expect(updatedDealToOrder.order).toBe(9);
  });

  test('Deal change customer', async () => {
    const newCustomer = await customerFactory({});

    const customer1 = await customerFactory({});
    const customer2 = await customerFactory({});
    const dealObj = await dealFactory({
      customerIds: [customer2._id, customer1._id],
    });

    await Deals.changeCustomer(newCustomer._id, [customer2._id, customer1._id]);

    const result = await Deals.findOne({ _id: dealObj._id });

    if (!result) {
      throw new Error('Deal not found');
    }

    expect(result.customerIds).toContain(newCustomer._id);
    expect(result.customerIds).not.toContain(customer1._id);
    expect(result.customerIds).not.toContain(customer2._id);
  });

  test('Deal change company', async () => {
    const newCompany = await companyFactory({});

    const company1 = await companyFactory({});
    const company2 = await companyFactory({});
    const dealObj = await dealFactory({
      companyIds: [company1._id, company2._id],
    });

    await Deals.changeCompany(newCompany._id, [company1._id, company2._id]);

    const result = await Deals.findOne({ _id: dealObj._id });

    if (!result) {
      throw new Error('Deal not found');
    }

    expect(result.companyIds).toContain(newCompany._id);
    expect(result.companyIds).not.toContain(company1._id);
    expect(result.companyIds).not.toContain(company2._id);
  });
});
