/* eslint-env jest */

import { TAG_TYPES } from '../data/constants';
import { Forms } from '../db/models';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import { formFactory, tagsFactory } from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

describe('formQueries', () => {
  const qryForms = `
    query forms($page: Int $perPage: Int, $tag: String) {
      forms(page: $page perPage: $perPage, tag: $tag) {
        _id
        title
        code
        description
        buttonText
        themeColor
        callout {
          title
          body
          buttonText
          featuredImage
          skip
        }
        createdUserId
        createdDate
        viewCount
        contactsGathered
        tagIds
      }
    }
  `;

  afterEach(async () => {
    // Clearing test data
    await Forms.remove({});
  });

  test('Forms', async () => {
    // Creating test data
    await formFactory({});
    await formFactory({});
    await formFactory({});

    const args = {
      page: 1,
      perPage: 2,
    };

    const response = await graphqlRequest(qryForms, 'forms', args);

    expect(response.length).toBe(2);
  });

  test('Forms filtered by tag', async () => {
    await formFactory({});
    await formFactory({});
    await formFactory({});

    const tagObj = await tagsFactory({ type: TAG_TYPES.FORM });

    const args = {
      page: 1,
      perPage: 20,
      tag: tagObj._id,
    };
    // Forms filtered by tag
    await formFactory({ tagIds: [tagObj._id] });

    const response = await graphqlRequest(qryForms, 'forms', args);

    expect(response.length).toBe(1);
  });

  test('Form detail', async () => {
    const form = await formFactory({});

    const qry = `
      query formDetail($_id: String!) {
        formDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'formDetail', { _id: form._id });

    expect(response._id).toBe(form._id);
  });

  test('Get total count of form', async () => {
    // Creating test data
    await formFactory({});
    await formFactory({});
    await formFactory({});

    const tagObj = await tagsFactory({ type: TAG_TYPES.FORM });
    await formFactory({ tagIds: [tagObj._id] });

    const qry = `
      query formsTotalCount {
        formsTotalCount
      }
    `;

    const response = await graphqlRequest(qry, 'formsTotalCount');

    expect(response.total).toBe(4);
    expect(response.byTag[tagObj._id]).toBe(1);
  });
});
