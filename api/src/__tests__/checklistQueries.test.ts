import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import { checklistFactory, checklistItemFactory } from '../db/factories';
import { ChecklistItems, Checklists } from '../db/models';

import './setup.ts';

describe('checklistQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Checklists.deleteMany({});
    await ChecklistItems.deleteMany({});
  });

  test('checklists', async () => {
    // Creating test data
    const contentTypeId = (faker && faker.random ? faker.random.number() : 999).toString();

    const checklist1 = await checklistFactory({ contentType: 'deal', contentTypeId });
    await checklistFactory({ contentType: 'task', contentTypeId });

    await checklistItemFactory({ checklistId: checklist1._id, isChecked: true });
    await checklistItemFactory({ checklistId: checklist1._id, isChecked: true });
    await checklistItemFactory({ checklistId: checklist1._id });
    await checklistItemFactory({ checklistId: checklist1._id });

    const qry = `
      query checklists($contentType: String! $contentTypeId: String) {
        checklists(contentType: $contentType contentTypeId: $contentTypeId) {
          _id
          contentType
          contentTypeId
          title
          createdUserId
          createdDate
          items {
            _id
            isChecked
            content
          }
          percent
        }
      }
    `;

    // deal ===========================
    let responses = await graphqlRequest(qry, 'checklists', {
      contentType: 'deal',
      contentTypeId,
    });

    expect(responses.length).toBe(1);
    expect(responses[0].items.length).toBe(4);
    expect(responses[0].percent).toBe(50);

    // task ============================
    responses = await graphqlRequest(qry, 'checklists', {
      contentType: 'task',
      contentTypeId,
    });

    expect(responses.length).toBe(1);
    expect(responses[0].percent).toBe(0);
  });

  test('Checklist detail', async () => {
    const qry = `
      query checklistDetail($_id: String!) {
        checklistDetail(_id: $_id) {
          _id
        }
      }
    `;

    const checklist = await checklistFactory({});

    const response = await graphqlRequest(qry, 'checklistDetail', { _id: checklist._id });

    expect(response._id).toBe(checklist._id);
  });
});
