import * as faker from 'faker';
import { connect, disconnect, graphqlRequest } from '../db/connection';
import { Brands, KnowledgeBaseArticles, KnowledgeBaseCategories, KnowledgeBaseTopics, Users } from '../db/models';

import {
  brandFactory,
  knowledgeBaseArticleFactory,
  knowledgeBaseCategoryFactory,
  knowledgeBaseTopicFactory,
  userFactory,
} from '../db/factories';

beforeAll(() => connect());

afterAll(() => disconnect());

/*
 * Generated test data
 */
const topicArgs = {
  title: faker.random.word(),
  description: faker.random.word(),
  color: faker.commerce.color(),
  languageCode: 'en',
};

const categoryArgs = {
  title: faker.random.word(),
  description: faker.random.word(),
  icon: faker.random.word(),
};

const articleArgs = {
  title: faker.random.word(),
  summary: faker.random.word(),
  status: 'draft',
  content: faker.random.word(),
};

describe('mutations', () => {
  let _knowledgeBaseTopic;
  let _knowledgeBaseCategory;
  let _knowledgeBaseArticle;
  let _brand;
  let _user;
  let context;

  beforeEach(async () => {
    // Creating test data
    _knowledgeBaseTopic = await knowledgeBaseTopicFactory({});
    _knowledgeBaseCategory = await knowledgeBaseCategoryFactory({});
    _knowledgeBaseArticle = await knowledgeBaseArticleFactory({});
    _brand = await brandFactory({});
    _user = await userFactory({});

    context = { user: _user };
  });

  afterEach(async () => {
    // Clearing test data
    await KnowledgeBaseTopics.remove({});
    await KnowledgeBaseCategories.remove({});
    await KnowledgeBaseArticles.remove({});
    await Users.remove({});
    await Brands.remove({});
  });

  test('Add knowledge base topic', async () => {
    const doc = {
      categoryIds: _knowledgeBaseCategory._id,
      brandId: _brand._id,
      ...topicArgs,
    };

    const mutation = `
      mutation knowledgeBaseTopicsAdd($doc: KnowledgeBaseTopicDoc!) {
        knowledgeBaseTopicsAdd(doc: $doc) {
          title
          description
          color
          brand {
            _id
          }
          languageCode
          categories {
            _id
          }
        }
      }
    `;

    const knowledgeBaseTopic = await graphqlRequest(mutation, 'knowledgeBaseTopicsAdd', { doc }, context);

    expect(knowledgeBaseTopic.title).toBe(doc.title);
    expect(knowledgeBaseTopic.description).toBe(doc.description);
    expect(knowledgeBaseTopic.color).toBe(doc.color);
    expect(knowledgeBaseTopic.brand._id).toBe(doc.brandId);
    expect(knowledgeBaseTopic.languageCode).toBe(doc.languageCode);
    expect(knowledgeBaseTopic.categories[0]._id).toEqual(doc.categoryIds);
  });

  test('Edit knowledge base topic', async () => {
    const doc = {
      categoryIds: _knowledgeBaseCategory._id,
      brandId: _brand._id,
      ...topicArgs,
    };

    const mutation = `
      mutation knowledgeBaseTopicsEdit($_id: String! $doc: KnowledgeBaseTopicDoc!) {
        knowledgeBaseTopicsEdit(_id: $_id doc: $doc) {
          _id
          title
          description
          color
          brand {
            _id
          }
          languageCode
          categories {
            _id
          }
        }
      }
    `;

    const knowledgeBaseTopic = await graphqlRequest(
      mutation,
      'knowledgeBaseTopicsEdit',
      { _id: _knowledgeBaseTopic._id, doc },
      context,
    );

    expect(knowledgeBaseTopic._id).toBe(_knowledgeBaseTopic._id);
    expect(knowledgeBaseTopic.title).toBe(doc.title);
    expect(knowledgeBaseTopic.description).toBe(doc.description);
    expect(knowledgeBaseTopic.color).toBe(doc.color);
    expect(knowledgeBaseTopic.brand._id).toBe(doc.brandId);
    expect(knowledgeBaseTopic.languageCode).toBe(doc.languageCode);
    expect(knowledgeBaseTopic.categories[0]._id).toEqual(doc.categoryIds);
  });

  test('Remove knowledge base topic', async () => {
    const _id = _knowledgeBaseTopic._id;

    const mutation = `
      mutation knowledgeBaseTopicsRemove($_id: String!) {
        knowledgeBaseTopicsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'knowledgeBaseTopicsRemove', { _id }, context);

    expect(await KnowledgeBaseTopics.findOne({ _id })).toBe(null);
  });

  test('Add knowledge base category', async () => {
    const doc = {
      articleIds: [_knowledgeBaseArticle._id],
      topicIds: _knowledgeBaseTopic._id,
      ...categoryArgs,
    };

    const mutation = `
      mutation knowledgeBaseCategoriesAdd($doc: KnowledgeBaseCategoryDoc!) {
        knowledgeBaseCategoriesAdd(doc: $doc) {
          title
          description
          icon
          articles {
            _id
          }
          firstTopic {
            _id
          }
        }
      }
    `;

    const knowledgeBaseCategory = await graphqlRequest(mutation, 'knowledgeBaseCategoriesAdd', { doc }, context);

    expect(knowledgeBaseCategory.title).toBe(doc.title);
    expect(knowledgeBaseCategory.description).toBe(doc.description);
    expect(knowledgeBaseCategory.icon).toBe(doc.icon);

    const articleIds = knowledgeBaseCategory.articles.map(a => a._id);
    expect(doc.articleIds).toEqual(articleIds);

    expect(knowledgeBaseCategory.firstTopic._id).toBe(doc.topicIds);
  });

  test('Edit knowledge base category', async () => {
    const doc = {
      articleIds: [_knowledgeBaseArticle._id],
      topicIds: _knowledgeBaseTopic._id,
      ...categoryArgs,
    };

    const mutation = `
      mutation knowledgeBaseCategoriesEdit($_id: String! $doc: KnowledgeBaseCategoryDoc!) {
        knowledgeBaseCategoriesEdit(_id: $_id doc: $doc) {
          _id
          title
          description
          icon
          articles {
            _id
          }
          firstTopic {
            _id
          }
        }
      }
    `;

    const knowledgeBaseCategory = await graphqlRequest(
      mutation,
      'knowledgeBaseCategoriesEdit',
      { _id: _knowledgeBaseCategory._id, doc },
      context,
    );

    expect(knowledgeBaseCategory._id).toBe(_knowledgeBaseCategory._id);
    expect(knowledgeBaseCategory.title).toBe(doc.title);
    expect(knowledgeBaseCategory.description).toBe(doc.description);
    expect(knowledgeBaseCategory.icon).toBe(doc.icon);

    const articleIds = knowledgeBaseCategory.articles.map(a => a._id);
    expect(doc.articleIds).toEqual(articleIds);

    expect(knowledgeBaseCategory.firstTopic._id).toBe(doc.topicIds);
  });

  test('Remove knowledge base category', async () => {
    const _id = _knowledgeBaseCategory._id;

    const mutation = `
      mutation knowledgeBaseCategoriesRemove($_id: String!) {
        knowledgeBaseCategoriesRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'knowledgeBaseCategoriesRemove', { _id }, context);

    expect(await KnowledgeBaseCategories.findOne({ _id })).toBe(null);
  });

  test('Add knowledge base article', async () => {
    const doc = {
      categoryIds: [_knowledgeBaseCategory._id],
      ...articleArgs,
    };

    const mutation = `
      mutation knowledgeBaseArticlesAdd($doc: KnowledgeBaseArticleDoc!) {
        knowledgeBaseArticlesAdd(doc: $doc) {
          _id
          title
          summary
          content
          status
        }
      }
    `;

    const article = await graphqlRequest(mutation, 'knowledgeBaseArticlesAdd', { doc }, context);

    const [category] = await KnowledgeBaseCategories.find({
      _id: { $in: doc.categoryIds },
    });

    expect(category.articleIds).toContain(article._id);
    expect(article.title).toBe(doc.title);
    expect(article.summary).toBe(doc.summary);
    expect(article.content).toBe(doc.content);
    expect(article.status).toBe(doc.status);
  });

  test('Edit knowledge base article', async () => {
    const doc = {
      categoryIds: [_knowledgeBaseCategory._id],
      ...articleArgs,
    };

    const mutation = `
      mutation knowledgeBaseArticlesEdit($_id: String! $doc: KnowledgeBaseArticleDoc!) {
        knowledgeBaseArticlesEdit(_id: $_id doc: $doc) {
          _id
          title
          summary
          content
          status
        }
      }
    `;

    const article = await graphqlRequest(
      mutation,
      'knowledgeBaseArticlesEdit',
      { _id: _knowledgeBaseArticle._id, doc },
      context,
    );

    const [category] = await KnowledgeBaseCategories.find({
      _id: { $in: doc.categoryIds },
    });

    expect(category.articleIds).toContain(article._id);
    expect(article._id).toBe(_knowledgeBaseArticle._id);
    expect(article.title).toBe(doc.title);
    expect(article.summary).toBe(doc.summary);
    expect(article.content).toBe(doc.content);
    expect(article.status).toBe(doc.status);
  });

  test('Remove knowledge base article', async () => {
    const _id = _knowledgeBaseArticle._id;

    const mutation = `
      mutation knowledgeBaseArticlesRemove($_id: String!) {
        knowledgeBaseArticlesRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'knowledgeBaseArticlesRemove', { _id }, context);

    expect(await KnowledgeBaseArticles.findOne({ _id })).toBe(null);
  });
});
