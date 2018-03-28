/* eslint-env jest */

import { KnowledgeBaseArticles, KnowledgeBaseCategories, KnowledgeBaseTopics } from '../db/models';
import { graphqlRequest, connect, disconnect } from '../db/connection';
import {
  knowledgeBaseArticleFactory,
  knowledgeBaseCategoryFactory,
  knowledgeBaseTopicFactory,
} from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

const generateData = params => {
  const { n, name, args } = params;
  const promises = [];

  let factory;
  let i = 1;

  switch (name) {
    case 'topic':
      factory = knowledgeBaseTopicFactory;
      break;
    case 'article':
      factory = knowledgeBaseArticleFactory;
      break;
    case 'category':
      factory = knowledgeBaseCategoryFactory;
      break;
  }

  while (i <= n) {
    promises.push(factory(args));

    i++;
  }

  return Promise.all(promises);
};

describe('knowledgeBaseQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await KnowledgeBaseArticles.remove({});
    await KnowledgeBaseCategories.remove({});
    await KnowledgeBaseTopics.remove({});
  });

  test('Knowledge base topics', async () => {
    // Creating test data
    await generateData({ n: 3, name: 'topic' });

    const query = `
      query knowledgeBaseTopics($page: Int $perPage: Int) {
        knowledgeBaseTopics(page: $page perPage: $perPage) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'knowledgeBaseTopics', { page: 1, perPage: 5 });

    expect(response.length).toBe(3);
  });

  test('Knowledge base topic detail', async () => {
    const knowledgeBaseTopic = await knowledgeBaseTopicFactory();

    const query = `
      query knowledgeBaseTopicDetail($_id: String!) {
        knowledgeBaseTopicDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'knowledgeBaseTopicDetail', {
      _id: knowledgeBaseTopic._id,
    });

    expect(response._id).toBe(knowledgeBaseTopic._id);
  });

  test('Get total count of knowledge base topic', async () => {
    // Creating test data
    await generateData({ n: 3, name: 'topic' });

    const query = `
      query knowledgeBaseTopicsTotalCount {
        knowledgeBaseTopicsTotalCount
      }
    `;

    const response = await graphqlRequest(query, 'knowledgeBaseTopicsTotalCount');

    expect(response).toBe(3);
  });

  test('Knowledge base categories', async () => {
    const topic = await knowledgeBaseTopicFactory();

    // Creating test data
    await generateData({
      n: 3,
      name: 'category',
      args: { topicIds: [topic._id] },
    });

    const args = {
      page: 1,
      perPage: 5,
      topicIds: topic._id,
    };

    const query = `
      query knowledgeBaseCategories(
        $page: Int
        $perPage: Int
        $topicIds: [String]
      ) {
        knowledgeBaseCategories(
          page: $page
          perPage: $perPage
          topicIds: $topicIds
        ) {
          _id
        }
      }
    `;

    const responses = await graphqlRequest(query, 'knowledgeBaseCategories', args);

    expect(responses.length).toBe(3);
  });

  test('Knowledge base category detail', async () => {
    const topic = await knowledgeBaseTopicFactory();

    const category = await knowledgeBaseCategoryFactory({ topicIds: [topic._id] });

    const query = `
      query knowledgeBaseCategoryDetail($_id: String!) {
        knowledgeBaseCategoryDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'knowledgeBaseCategoryDetail', {
      _id: category._id,
    });

    expect(response._id).toBe(category._id);
  });

  test('Get total count of knowledge base category', async () => {
    const topic = await knowledgeBaseTopicFactory();

    // Creating test data
    await generateData({
      n: 3,
      name: 'category',
      args: { topicIds: [topic._id] },
    });

    const query = `
      query knowledgeBaseCategoriesTotalCount($topicIds: [String]) {
        knowledgeBaseCategoriesTotalCount(topicIds: $topicIds)
      }
    `;

    const response = await graphqlRequest(query, 'knowledgeBaseCategoriesTotalCount', {
      topicIds: topic._id,
    });

    expect(response).toBe(3);
  });

  test('Knowledge base articles', async () => {
    const category = await knowledgeBaseCategoryFactory();

    // Creating test data
    await generateData({
      n: 3,
      name: 'article',
      args: { categoryIds: [category._id] },
    });

    const args = {
      page: 1,
      perPage: 5,
      categoryIds: [category._id],
    };

    const query = `
      query knowledgeBaseArticles(
        $page: Int
        $perPage: Int
        $categoryIds: [String]
      ) {
        knowledgeBaseArticles(
          page: $page
          perPage: $perPage
          categoryIds: $categoryIds
        ) {
          _id
        }
      }
    `;

    const responses = await graphqlRequest(query, 'knowledgeBaseArticles', args);

    expect(responses.length).toBe(3);
  });

  test('Knowledge base article detail', async () => {
    const category = await knowledgeBaseCategoryFactory();

    const article = await knowledgeBaseArticleFactory({ categoryIds: [category._id] });

    const query = `
      query knowledgeBaseArticleDetail($_id: String!) {
        knowledgeBaseArticleDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(query, 'knowledgeBaseArticleDetail', {
      _id: article._id,
    });

    expect(response._id).toBe(article._id);
  });

  test('Get total count of knowledge base article', async () => {
    const category = await knowledgeBaseCategoryFactory();

    // Creating test data
    await generateData({
      n: 3,
      name: 'article',
      args: { categoryIds: [category._id] },
    });

    const query = `
      query knowledgeBaseArticlesTotalCount($categoryIds: [String]) {
        knowledgeBaseArticlesTotalCount(categoryIds: $categoryIds)
      }
    `;

    const response = await graphqlRequest(query, 'knowledgeBaseArticlesTotalCount', {
      categoryIds: [category._id],
    });

    expect(response).toBe(3);
  });
});
