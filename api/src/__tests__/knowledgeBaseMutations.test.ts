import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import {
  Brands,
  KnowledgeBaseArticles,
  KnowledgeBaseCategories,
  KnowledgeBaseTopics,
  Users
} from '../db/models';
import { PUBLISH_STATUSES } from '../db/models/definitions/constants';

import {
  brandFactory,
  knowledgeBaseArticleFactory,
  knowledgeBaseCategoryFactory,
  knowledgeBaseTopicFactory,
  userFactory
} from '../db/factories';

import './setup.ts';

/*
 * Generated test data
 */
const topicArgs = {
  title: faker.random.word(),
  description: faker.random.word(),
  color: faker.commerce.color(),
  languageCode: 'en'
};

const categoryArgs = {
  title: faker.random.word(),
  description: faker.random.word(),
  icon: faker.random.word()
};

const articleArgs = {
  title: faker.random.word(),
  summary: faker.random.word(),
  status: PUBLISH_STATUSES.DRAFT,
  content: faker.random.word()
};

describe('mutations', () => {
  let _knowledgeBaseTopic;
  let _knowledgeBaseCategory;
  let _knowledgeBaseArticle;
  let _brand;

  beforeEach(async () => {
    // Creating test data
    _knowledgeBaseTopic = await knowledgeBaseTopicFactory({});
    _knowledgeBaseCategory = await knowledgeBaseCategoryFactory({
      topicId: _knowledgeBaseTopic._id
    });
    _knowledgeBaseArticle = await knowledgeBaseArticleFactory({
      status: PUBLISH_STATUSES.PUBLISH,
      topicId: _knowledgeBaseTopic._id,
      categoryId: _knowledgeBaseCategory._id
    });
    _brand = await brandFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await KnowledgeBaseTopics.deleteMany({});
    await KnowledgeBaseCategories.deleteMany({});
    await KnowledgeBaseArticles.deleteMany({});
    await Users.deleteMany({});
    await Brands.deleteMany({});
  });

  test('Add knowledge base topic', async () => {
    const doc = {
      brandId: _brand._id,
      ...topicArgs
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

    const knowledgeBaseTopic = await graphqlRequest(
      mutation,
      'knowledgeBaseTopicsAdd',
      { doc }
    );

    expect(knowledgeBaseTopic.title).toBe(doc.title);
    expect(knowledgeBaseTopic.description).toBe(doc.description);
    expect(knowledgeBaseTopic.color).toBe(doc.color);
    expect(knowledgeBaseTopic.brand._id).toBe(doc.brandId);
    expect(knowledgeBaseTopic.languageCode).toBe(doc.languageCode);
  });

  test('Edit knowledge base topic', async () => {
    const doc = {
      brandId: _brand._id,
      ...topicArgs
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
      {
        _id: _knowledgeBaseTopic._id,
        doc
      }
    );

    expect(knowledgeBaseTopic._id).toBe(_knowledgeBaseTopic._id);
    expect(knowledgeBaseTopic.title).toBe(doc.title);
    expect(knowledgeBaseTopic.description).toBe(doc.description);
    expect(knowledgeBaseTopic.color).toBe(doc.color);
    expect(knowledgeBaseTopic.brand._id).toBe(doc.brandId);
    expect(knowledgeBaseTopic.languageCode).toBe(doc.languageCode);
  });

  test('Remove knowledge base topic', async () => {
    const _id = _knowledgeBaseTopic._id;

    const mutation = `
      mutation knowledgeBaseTopicsRemove($_id: String!) {
        knowledgeBaseTopicsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'knowledgeBaseTopicsRemove', { _id });

    expect(await KnowledgeBaseTopics.findOne({ _id })).toBe(null);
  });

  test('Add knowledge base category', async () => {
    const doc = {
      articleIds: [_knowledgeBaseArticle._id],
      ...categoryArgs
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

    const knowledgeBaseCategory = await graphqlRequest(
      mutation,
      'knowledgeBaseCategoriesAdd',
      { doc }
    );

    expect(knowledgeBaseCategory.title).toBe(doc.title);
    expect(knowledgeBaseCategory.description).toBe(doc.description);
    expect(knowledgeBaseCategory.icon).toBe(doc.icon);
  });

  test('Edit knowledge base category', async () => {
    const doc = {
      topicIds: _knowledgeBaseTopic._id,
      ...categoryArgs
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
      {
        _id: _knowledgeBaseCategory._id,
        doc
      }
    );

    expect(knowledgeBaseCategory._id).toBe(_knowledgeBaseCategory._id);
    expect(knowledgeBaseCategory.title).toBe(doc.title);
    expect(knowledgeBaseCategory.description).toBe(doc.description);
    expect(knowledgeBaseCategory.icon).toBe(doc.icon);

    expect(knowledgeBaseCategory.firstTopic._id).toBe(doc.topicIds);
  });

  test('Remove knowledge base category', async () => {
    const _id = _knowledgeBaseCategory._id;

    const mutation = `
      mutation knowledgeBaseCategoriesRemove($_id: String!) {
        knowledgeBaseCategoriesRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'knowledgeBaseCategoriesRemove', { _id });

    expect(await KnowledgeBaseCategories.findOne({ _id })).toBe(null);
  });

  test('Add knowledge base article', async () => {
    const doc = articleArgs;

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

    const article = await graphqlRequest(mutation, 'knowledgeBaseArticlesAdd', {
      doc
    });

    expect(article.title).toBe(doc.title);
    expect(article.summary).toBe(doc.summary);
    expect(article.content).toBe(doc.content);
    expect(article.status).toBe(doc.status);
  });

  test('Edit knowledge base article', async () => {
    const doc = articleArgs;

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
      {
        _id: _knowledgeBaseArticle._id,
        doc
      }
    );

    expect(article._id).toBe(_knowledgeBaseArticle._id);
    expect(article.title).toBe(doc.title);
    expect(article.summary).toBe(doc.summary);
    expect(article.content).toBe(doc.content);
    expect(article.status).toBe(doc.status);
  });

  test('Remove knowledge base article', async () => {
    const user = await userFactory();
    const article = await knowledgeBaseArticleFactory({ modifiedBy: user._id });

    const mutation = `
      mutation knowledgeBaseArticlesRemove($_id: String!) {
        knowledgeBaseArticlesRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'knowledgeBaseArticlesRemove', {
      _id: article._id
    });

    expect(await KnowledgeBaseArticles.findOne({ _id: article._id })).toBe(
      null
    );
  });
});
