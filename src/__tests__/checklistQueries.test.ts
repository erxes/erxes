import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import { checklistFactory, checklistItemFactory } from '../db/factories';
import { Checklists } from '../db/models';

import './setup.ts';

describe('checklistQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Checklists.deleteMany({});
  });

  test('checklists', async () => {
    // Creating test data
    const contentTypeId = (faker && faker.random ? faker.random.number() : 999).toString();

    const checklist1 = await checklistFactory({ contentType: 'deal', contentTypeId });
    const checklist2 = await checklistFactory({ contentType: 'task', contentTypeId });
    await checklistItemFactory({ checklistId: checklist1._id, isChecked: true });
    await checklistItemFactory({ checklistId: checklist1._id, isChecked: true });
    await checklistItemFactory({ checklistId: checklist1._id });
    await checklistItemFactory({ checklistId: checklist1._id });
    await checklistItemFactory({ checklistId: checklist2._id });

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
    expect(responses[0].items.length).toBe(1);
    expect(responses[0].percent).toBe(0);
  });
});
