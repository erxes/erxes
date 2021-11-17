import { graphqlRequest } from '../db/connection';
import {
  boardFactory,
  checklistFactory,
  checklistItemFactory,
  companyFactory,
  conformityFactory,
  customerFactory,
  dealFactory,
  pipelineFactory,
  pipelineLabelFactory,
  productFactory,
  stageFactory,
  userFactory
} from '../db/factories';
import {
  Boards,
  ChecklistItems,
  Checklists,
  Conformities,
  Deals,
  PipelineLabels,
  Pipelines,
  Products,
  Stages
} from '../db/models';
import {
  IBoardDocument,
  IPipelineDocument,
  IStageDocument
} from '../db/models/definitions/boards';
import {
  BOARD_STATUSES,
  BOARD_TYPES
} from '../db/models/definitions/constants';
import {
  IDealDocument,
  IProductDocument
} from '../db/models/definitions/deals';
import { IPipelineLabelDocument } from '../db/models/definitions/pipelineLabels';
import { IUserDocument } from '../db/models/definitions/users';

import './setup.ts';

describe('Test deals mutations', () => {
  let board: IBoardDocument;
  let pipeline: IPipelineDocument;
  let stage: IStageDocument;
  let deal: IDealDocument;
  let label: IPipelineLabelDocument;
  let product: IProductDocument;
  let user: IUserDocument;

  const commonDealParamDefs = `
    $name: String!
    $stageId: String!
    $assignedUserIds: [String]
    $productsData: JSON
    $status: String
  `;

  const commonDealParams = `
    name: $name
    stageId: $stageId
    assignedUserIds: $assignedUserIds
    productsData: $productsData
    status: $status
  `;

  const commonDragParamDefs = `
    $itemId: String!,
    $aboveItemId: String,
    $destinationStageId: String!,
    $sourceStageId: String,
    $proccessId: String
  `;

  const commonDragParams = `
    itemId: $itemId,
    aboveItemId: $aboveItemId,
    destinationStageId: $destinationStageId,
    sourceStageId: $sourceStageId,
    proccessId: $proccessId
  `;

  beforeEach(async () => {
    // Creating test data
    user = await userFactory();

    board = await boardFactory({ type: BOARD_TYPES.DEAL });
    pipeline = await pipelineFactory({
      boardId: board._id,
      watchedUserIds: [user._id]
    });
    stage = await stageFactory({ pipelineId: pipeline._id });
    label = await pipelineLabelFactory({ pipelineId: pipeline._id });
    product = await productFactory();
    deal = await dealFactory({
      initialStageId: stage._id,
      stageId: stage._id,
      labelIds: [label._id],
      productsData: [{ productId: product._id }]
    });
  });

  afterEach(async () => {
    // Clearing test data
    await Boards.deleteMany({});
    await Pipelines.deleteMany({});
    await Stages.deleteMany({});
    await Deals.deleteMany({});
    await PipelineLabels.deleteMany({});
    await Products.deleteMany({});
  });

  test('Create deal', async () => {
    const args = {
      name: deal.name,
      stageId: stage._id,
      customerIds: ['fakeCustomerId'],
      companyIds: ['fakeCompanyId']
    };

    const mutation = `
      mutation dealsAdd(${commonDealParamDefs} $customerIds: [String] $companyIds: [String]) {
        dealsAdd(${commonDealParams} customerIds: $customerIds companyIds: $companyIds) {
          _id
          name
          stageId
        }
      }
    `;

    const createdDeal = await graphqlRequest(mutation, 'dealsAdd', args);

    expect(createdDeal.stageId).toEqual(stage._id);
  });

  test('Update deal', async () => {
    const mutation = `
      mutation dealsEdit($_id: String!, ${commonDealParamDefs}) {
        dealsEdit(_id: $_id, ${commonDealParams}) {
          _id
          name
          stageId
          assignedUserIds
        }
      }
    `;

    const product2 = await productFactory();

    const args: any = {
      _id: deal._id,
      name: deal.name,
      stageId: stage._id,
      productsData: [{ productId: product2._id }, { productId: product._id }]
    };

    let response = await graphqlRequest(mutation, 'dealsEdit', args);

    expect(response.stageId).toEqual(stage._id);

    // if assignedUserIds is not empty
    const user1 = await userFactory();
    args.assignedUserIds = [user1._id];

    response = await graphqlRequest(mutation, 'dealsEdit', args);

    expect(response.assignedUserIds).toContain(user1._id);

    // if assigned productsData
    const user2 = await userFactory();
    args.productsData.push({
      productId: product2._id,
      assignUserId: user2._id
    });

    response = await graphqlRequest(mutation, 'dealsEdit', args);

    expect(response.assignedUserIds).toContain(user2._id);

    // if assigned productsData unassign assignedUserIds
    delete args.productsData;
    try {
      response = await graphqlRequest(mutation, 'dealsEdit', args);
    } catch (e) {
      expect(e).toBeDefined();
    }

    // not products data and assigneduserIDs
    args.productsData = [];
    args.status = 'archived';

    delete args.assignedUserIds;
    response = await graphqlRequest(mutation, 'dealsEdit', args);

    expect(response.assignedUserIds).toEqual([user1._id]);
  });

  test('Change deal', async () => {
    const args = {
      proccessId: Math.random().toString(),
      itemId: deal._id,
      aboveItemId: '',
      destinationStageId: deal.stageId,
      sourceStageId: deal.stageId
    };

    const mutation = `
      mutation dealsChange(${commonDragParamDefs}) {
        dealsChange(${commonDragParams}) {
          _id
          name
          stageId
          order
        }
      }
    `;

    const updatedDeal = await graphqlRequest(mutation, 'dealsChange', args);

    expect(updatedDeal._id).toEqual(args.itemId);
  });

  test('Change deal if move to another stage', async () => {
    const anotherStage = await stageFactory({
      pipelineId: pipeline._id,
      probability: 'Won'
    });

    const args = {
      proccessId: Math.random().toString(),
      itemId: deal._id,
      aboveItemId: '',
      destinationStageId: anotherStage._id,
      sourceStageId: deal.stageId
    };

    const mutation = `
      mutation dealsChange(${commonDragParamDefs}) {
        dealsChange(${commonDragParams}) {
          _id
          name
          stageId
          order
        }
      }
    `;

    let updatedDeal = await graphqlRequest(mutation, 'dealsChange', args);

    expect(updatedDeal._id).toEqual(args.itemId);

    // deal moved from won stage
    args.sourceStageId = anotherStage._id;
    args.destinationStageId = deal.stageId;

    updatedDeal = await graphqlRequest(mutation, 'dealsChange', args);

    expect(updatedDeal._id).toEqual(args.itemId);
  });

  test('Update deal move to pipeline stage', async () => {
    const mutation = `
      mutation dealsEdit($_id: String!, ${commonDealParamDefs}) {
        dealsEdit(_id: $_id, ${commonDealParams}) {
          _id
          name
          stageId
          assignedUserIds
        }
      }
    `;

    const anotherPipeline = await pipelineFactory({ boardId: board._id });
    const anotherStage = await stageFactory({
      pipelineId: anotherPipeline._id
    });

    const args = {
      _id: deal._id,
      stageId: anotherStage._id,
      name: deal.name || ''
    };

    const updatedDeal = await graphqlRequest(mutation, 'dealsEdit', args);

    expect(updatedDeal._id).toEqual(args._id);
    expect(updatedDeal.stageId).toEqual(args.stageId);
  });

  test('Remove deal', async () => {
    const mutation = `
      mutation dealsRemove($_id: String!) {
        dealsRemove(_id: $_id) {
          _id
        }
      }
    `;

    await graphqlRequest(mutation, 'dealsRemove', { _id: deal._id });

    expect(await Deals.findOne({ _id: deal._id })).toBe(null);
  });

  test('Watch deal', async () => {
    const mutation = `
      mutation dealsWatch($_id: String!, $isAdd: Boolean!) {
        dealsWatch(_id: $_id, isAdd: $isAdd) {
          _id
          isWatched
        }
      }
    `;

    const watchAddDeal = await graphqlRequest(mutation, 'dealsWatch', {
      _id: deal._id,
      isAdd: true
    });

    expect(watchAddDeal.isWatched).toBe(true);

    const watchRemoveDeal = await graphqlRequest(mutation, 'dealsWatch', {
      _id: deal._id,
      isAdd: false
    });

    expect(watchRemoveDeal.isWatched).toBe(false);
  });

  test('Test dealsCopy()', async () => {
    const mutation = `
      mutation dealsCopy($_id: String!) {
        dealsCopy(_id: $_id) {
          _id
          userId
          name
          stageId
        }
      }
    `;

    const checklist = await checklistFactory({
      contentType: 'deal',
      contentTypeId: deal._id,
      title: 'deal-checklist'
    });

    await checklistItemFactory({
      checklistId: checklist._id,
      content: 'Improve deal mutation test coverage',
      isChecked: true
    });

    const company = await companyFactory();
    const customer = await customerFactory();

    await conformityFactory({
      mainType: 'deal',
      mainTypeId: deal._id,
      relType: 'company',
      relTypeId: company._id
    });

    await conformityFactory({
      mainType: 'deal',
      mainTypeId: deal._id,
      relType: 'customer',
      relTypeId: customer._id
    });

    const result = await graphqlRequest(
      mutation,
      'dealsCopy',
      { _id: deal._id },
      { user }
    );

    const clonedDealCompanies = await Conformities.find({
      mainTypeId: result._id,
      relTypeId: company._id
    });
    const clonedDealCustomers = await Conformities.find({
      mainTypeId: result._id,
      relTypeId: company._id
    });
    const clonedDealChecklist = await Checklists.findOne({
      contentTypeId: result._id
    });

    if (clonedDealChecklist) {
      const clonedDealChecklistItems = await ChecklistItems.find({
        checklistId: clonedDealChecklist._id
      });

      expect(clonedDealChecklist.contentTypeId).toBe(result._id);
      expect(clonedDealChecklistItems.length).toBe(1);
    }

    expect(result.userId).toBe(user._id);
    expect(result.name).toBe(`${deal.name}-copied`);
    expect(result.stageId).toBe(deal.stageId);

    expect(clonedDealCompanies.length).toBe(1);
    expect(clonedDealCustomers.length).toBe(1);
  });

  test('Test archive', async () => {
    const mutation = `
      mutation dealsArchive($stageId: String!) {
        dealsArchive(stageId: $stageId)
      }
    `;

    const dealStage = await stageFactory({ type: BOARD_TYPES.DEAL });

    await dealFactory({ stageId: dealStage._id });
    await dealFactory({ stageId: dealStage._id });
    await dealFactory({ stageId: dealStage._id });

    await graphqlRequest(mutation, 'dealsArchive', { stageId: dealStage._id });

    const deals = await Deals.find({
      stageId: dealStage._id,
      status: BOARD_STATUSES.ARCHIVED
    });

    expect(deals.length).toBe(3);
  });
});
