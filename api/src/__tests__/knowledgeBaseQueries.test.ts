import { graphqlRequest } from '../db/connection';
import {
  knowledgeBaseArticleFactory,
  knowledgeBaseCategoryFactory,
  knowledgeBaseTopicFactory,
  userFactory
} from '../db/factories';
import {
  KnowledgeBaseArticles,
  KnowledgeBaseCategories,
  KnowledgeBaseTopics
} from '../db/models';

import './setup.ts';

describe('knowledgeBaseQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await KnowledgeBaseArticles.deleteMany({});
    await KnowledgeBaseCategories.deleteMany({});
    await KnowledgeBaseTopics.deleteMany({});
  });

  test('Knowledge base topics', async () => {
    // Creating test data
    await knowledgeBaseTopicFactory();
    await knowledgeBaseTopicFactory();
    await knowledgeBaseTopicFactory();

    const qry = `
      query knowledgeBaseTopics($page: Int $perPage: Int) {
        knowledgeBaseTopics(page: $page perPage: $perPage) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'knowledgeBaseTopics', {
      page: 1,
      perPage: 2
    });

    expect(response.length).toBe(2);
  });

  test('Knowledge base topic detail', async () => {
    const topic = await knowledgeBaseTopicFactory();

    const category = await knowledgeBaseCategoryFactory({ topicId: topic._id });
    await knowledgeBaseCategoryFactory({
      topicId: topic._id,
      parentCategoryId: category._id
    });

    const qry = `
      query knowledgeBaseTopicDetail($_id: String!) {
        knowledgeBaseTopicDetail(_id: $_id) {
          _id
          title
          description
          categories { _id }
          brand { _id }
          color
          languageCode
          createdBy
          createdDate
          modifiedBy
          modifiedDate


          parentCategories {
            _id

            childrens {
              _id
            }
          }
        }
      }
    `;

    let response = await graphqlRequest(qry, 'knowledgeBaseTopicDetail', {
      _id: topic._id
    });

    expect(response._id).toBe(topic._id);
    expect(response.parentCategories.length).toBe(1);
    expect(response.parentCategories[0].childrens.length).toBe(1);

    const knowledgeBaseTopicWithColor = await knowledgeBaseTopicFactory({
      color: '#fff'
    });

    response = await graphqlRequest(qry, 'knowledgeBaseTopicDetail', {
      _id: knowledgeBaseTopicWithColor._id
    });

    expect(response._id).toBe(knowledgeBaseTopicWithColor._id);
  });

  test('Get total count of knowledge base topic', async () => {
    // Creating test data
    await knowledgeBaseTopicFactory();
    await knowledgeBaseTopicFactory();
    await knowledgeBaseTopicFactory();

    const qry = `
      query knowledgeBaseTopicsTotalCount {
        knowledgeBaseTopicsTotalCount
      }
    `;

    const response = await graphqlRequest(qry, 'knowledgeBaseTopicsTotalCount');

    expect(response).toBe(3);
  });

  test('Knowledge base categories', async () => {
    const user = await userFactory({});
    const topic = await knowledgeBaseTopicFactory({});

    // Creating test data
    const category = await knowledgeBaseCategoryFactory({
      topicId: topic._id
    });

    await knowledgeBaseCategoryFactory({
      topicId: topic._id,
      parentCategoryId: category._id
    });

    await knowledgeBaseCategoryFactory({ topicId: topic._id });
    await knowledgeBaseCategoryFactory({});

    await knowledgeBaseArticleFactory({
      topicId: topic._id,
      categoryId: category._id,
      status: 'publish',
      userId: user._id
    });

    const args: any = {
      page: 1,
      perPage: 5,
      topicIds: [topic._id]
    };

    const qry = `
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
          title
          description
          articles {
            _id
            title
            summary
            content
            status
            createdBy
            createdUser { _id }
            createdDate
            modifiedBy
            modifiedDate
          }
          icon
          createdBy
          createdDate
          modifiedBy
          modifiedDate

          firstTopic {
            _id
            title
            description
            categories { _id }
            brand { _id }
            color
            languageCode
            createdBy
            createdDate
            modifiedBy
            modifiedDate
          }

          authors {
            _id
          }

          numOfArticles
        }
      }
    `;

    let responses = await graphqlRequest(qry, 'knowledgeBaseCategories', args, {
      user
    });

    expect(responses.length).toBe(3);

    responses = await graphqlRequest(
      qry,
      'knowledgeBaseCategories',
      { topicIds: [topic._id] },
      {
        user
      }
    );

    expect(responses.length).toBe(3);

    delete args.topicIds;
    responses = await graphqlRequest(qry, 'knowledgeBaseCategories', args);

    expect(responses.length).toBe(1);
  });

  test('Knowledge base category detail', async () => {
    const topic = await knowledgeBaseTopicFactory();

    const category = await knowledgeBaseCategoryFactory({
      topicId: topic._id
    });

    const qry = `
      query knowledgeBaseCategoryDetail($_id: String!) {
        knowledgeBaseCategoryDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'knowledgeBaseCategoryDetail', {
      _id: category._id
    });

    expect(response._id).toBe(category._id);
  });

  test('Get total count of knowledge base category', async () => {
    const topic = await knowledgeBaseTopicFactory();

    // Creating test data
    await knowledgeBaseCategoryFactory({ topicId: topic._id });
    await knowledgeBaseCategoryFactory({ topicId: topic._id });
    await knowledgeBaseCategoryFactory();

    const qry = `
      query knowledgeBaseCategoriesTotalCount($topicIds: [String]) {
        knowledgeBaseCategoriesTotalCount(topicIds: $topicIds)
      }
    `;

    let response = await graphqlRequest(
      qry,
      'knowledgeBaseCategoriesTotalCount',
      {
        topicIds: [topic._id]
      }
    );

    expect(response).toBe(2);

    response = await graphqlRequest(qry, 'knowledgeBaseCategoriesTotalCount');

    expect(response).toBe(1);
  });

  test('Knowledge base category detail', async () => {
    const topic = await knowledgeBaseTopicFactory();

    const lastCategory = await knowledgeBaseCategoryFactory({
      topicId: topic._id
    });

    const qry = `
      query knowledgeBaseCategoriesGetLast {
        knowledgeBaseCategoriesGetLast {
          _id
        }
      }
    `;

    const response = await graphqlRequest(
      qry,
      'knowledgeBaseCategoriesGetLast'
    );

    expect(response._id).toBe(lastCategory._id);
  });

  test('Knowledge base articles', async () => {
    const category = await knowledgeBaseCategoryFactory();

    // Creating test data
    await knowledgeBaseArticleFactory({ categoryId: category._id });
    await knowledgeBaseArticleFactory({ categoryId: category._id });
    await knowledgeBaseArticleFactory({});

    const args: any = {
      page: 1,
      perPage: 5,
      categoryIds: [category._id]
    };

    const qry = `
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
          title
          summary
          content
          status
          createdBy
          createdUser { _id }
          createdDate
          modifiedBy
          modifiedDate
        }
      }
    `;

    let responses = await graphqlRequest(qry, 'knowledgeBaseArticles', args);

    expect(responses.length).toBe(2);

    delete args.categoryIds;
    responses = await graphqlRequest(qry, 'knowledgeBaseArticles', args);

    expect(responses.length).toBe(1);
  });

  test('Knowledge base article detail', async () => {
    const category = await knowledgeBaseCategoryFactory();

    const article = await knowledgeBaseArticleFactory({
      categoryId: category._id
    });

    const qry = `
      query knowledgeBaseArticleDetail($_id: String!) {
        knowledgeBaseArticleDetail(_id: $_id) {
          _id
        }
      }
    `;

    const response = await graphqlRequest(qry, 'knowledgeBaseArticleDetail', {
      _id: article._id
    });

    expect(response._id).toBe(article._id);
  });

  test('Get total count of knowledge base article', async () => {
    const category = await knowledgeBaseCategoryFactory();

    // Creating test data
    await knowledgeBaseArticleFactory({ categoryId: category._id });
    await knowledgeBaseArticleFactory({ categoryId: category._id });
    await knowledgeBaseArticleFactory({});

    const qry = `
      query knowledgeBaseArticlesTotalCount($categoryIds: [String]) {
        knowledgeBaseArticlesTotalCount(categoryIds: $categoryIds)
      }
    `;

    let response = await graphqlRequest(
      qry,
      'knowledgeBaseArticlesTotalCount',
      {
        categoryIds: [category._id]
      }
    );

    expect(response).toBe(2);

    response = await graphqlRequest(qry, 'knowledgeBaseArticlesTotalCount');

    expect(response).toBe(1);
  });
});
