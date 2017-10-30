/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import toBeType from 'jest-tobetype';
import {
  knowledgeBaseCategoryFactory,
  knowledgeBaseArticleFactory,
  brandFactory,
  userFactory,
} from '../db/factories';
import {
  KnowledgeBaseTopics,
  KnowledgeBaseCategories,
  KnowledgeBaseArticles,
  Brands,
  Users,
} from '../db/models';
import { PUBLISH_STATUSES } from '../data/constants';

expect.extend(toBeType);

beforeAll(() => connect());
afterAll(() => disconnect());

describe('test knowledge base models', () => {
  let _user;

  beforeAll(async () => {
    _user = await userFactory();
  });

  afterAll(async () => {
    await Users.remove({});
  });

  describe('KnowledgeBaseTopics', () => {
    afterEach(async () => {
      await KnowledgeBaseTopics.remove({});
      await Brands.remove({});
      await KnowledgeBaseCategories.remove({});
    });

    test(`expect Error('userId must be supplied') to be called as intended`, () => {
      expect.assertions(1);

      try {
        KnowledgeBaseTopics.createDoc({}, null);
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('create', async () => {
      let categoryA = await knowledgeBaseCategoryFactory({});
      let categoryB = await knowledgeBaseCategoryFactory({});
      let brand = await brandFactory({});

      const doc = {
        title: 'Test topic title',
        description: 'Test topic description',
        categoryIds: [categoryA._id, categoryB._id],
        brandId: brand._id,
      };

      const topic = await KnowledgeBaseTopics.createDoc(doc, _user._id);

      expect(topic.title).toBe(doc.title);
      expect(topic.description).toBe(doc.description);
      expect(topic.categoryIds).toContain(categoryA._id);
      expect(topic.brandId).toBe(doc.brandId);
    });

    test('update', async () => {
      const categoryA = await knowledgeBaseCategoryFactory({});
      const categoryB = await knowledgeBaseCategoryFactory({});

      const brandA = await brandFactory({});
      const brandB = await brandFactory({});

      const doc = {
        title: 'Test topic title',
        description: 'Test topic description',
        categoryIds: [categoryA._id, categoryB._id],
        brandId: brandA._id,
      };

      const topic = await KnowledgeBaseTopics.createDoc(doc, _user._id);

      topic.title = 'Test topic title 2';
      topic.description = 'Test topic description 2';
      topic.categoryIds = [categoryA._id, categoryB._id];
      topic.brandId = brandB._id;

      const newTopic = await KnowledgeBaseTopics.updateDoc(topic._id, topic.toObject(), _user);

      expect(newTopic._id).toBe(topic._id);
      expect(newTopic.title).toBe(topic.title);
      expect(newTopic.categoryIds).toContain(categoryA._id);
      expect(newTopic.categoryIds).toContain(categoryB._id);
      expect(newTopic.brandId).toBe(brandB._id);
    });

    test('remove', async () => {
      const brand = await brandFactory({});
      const doc = {
        title: 'Test topic title',
        description: 'Test topic description',
        brandId: brand._id,
      };

      const topic = await KnowledgeBaseTopics.createDoc(doc, _user._id);

      expect(await KnowledgeBaseTopics.find().count()).toBe(1);

      await KnowledgeBaseTopics.removeDoc(topic._id);

      expect(await KnowledgeBaseTopics.find().count()).toBe(0);
    });
  });

  describe('KnowledgeBaseCategories', () => {
    afterEach(async () => {
      await KnowledgeBaseCategories.remove();
      await KnowledgeBaseArticles.remove({});
    });

    test(`expect Error('userId must be supplied') to be called as intended`, () => {
      expect.assertions(1);

      try {
        KnowledgeBaseCategories.createDoc({}, null);
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('create', async () => {
      const article = knowledgeBaseArticleFactory({});

      const doc = {
        title: 'Test category title',
        description: 'Test category description',
        articleIds: [article._id],
        icon: 'test category icon',
      };

      const category = await KnowledgeBaseCategories.createDoc(doc, _user._id);

      expect(category.title).toBe(doc.title);
      expect(category.description).toBe(doc.description);
      expect(category.articleIds).toContain(article._id);
      expect(category.icon).toBe(doc.icon);
      // Values related to modification ======
      expect(category.createdBy).toBe(_user._id);
      expect(category.createdDate).toBeType('object');
    });

    test('update', async () => {
      const article = await knowledgeBaseArticleFactory({});
      const articleB = await knowledgeBaseArticleFactory({});

      const doc = {
        title: 'Test category title',
        description: 'Test category description',
        articleIds: [article._id],
        icon: 'test icon',
      };

      const category = await KnowledgeBaseCategories.createDoc(doc, _user._id);

      category.title = 'Test category title 2';
      category.description = 'Test category description 2';
      category.articleIds = [article._id, articleB._id];
      category.icon = 'test icon 2';

      const newCategory = await KnowledgeBaseCategories.updateDoc(
        category._id,
        category.toObject(),
        _user._id,
      );

      expect(newCategory._id).toBe(category._id);
      expect(newCategory.title).toBe(category.title);
      expect(newCategory.description).toBe(category.description);
      expect(newCategory.articleIds).toContain(article._id);
      expect(newCategory.articleIds).toContain(articleB._id);
      expect(newCategory.icon).toBe(category.icon);

      // Values related to modification ======
      expect(newCategory.modifiedBy).toBe(_user._id);
      expect(newCategory.modifiedDate).toBeType('object');
    });

    test('remove', async () => {
      const doc = {
        title: 'Test category title',
        description: 'Test category description',
        icon: 'test icon',
      };

      const category = await KnowledgeBaseCategories.createDoc(doc, _user._id);

      expect(await KnowledgeBaseCategories.find().count()).toBe(1);

      await KnowledgeBaseCategories.removeDoc(category._id);

      expect(await KnowledgeBaseCategories.find().count()).toBe(0);
    });
  });

  describe('KnowledgeBaseArticles', () => {
    afterEach(async () => {
      await KnowledgeBaseArticles.remove({});
    });

    test(`expect Error('userId must be supplied') to be called as intended`, () => {
      expect.assertions(1);

      try {
        KnowledgeBaseArticles.createDoc({}, null);
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('create', async () => {
      const doc = {
        title: 'Test article title',
        summary: 'Test article description',
        content: 'Test article content',
        status: PUBLISH_STATUSES.DRAFT,
      };

      const article = await KnowledgeBaseArticles.createDoc(doc, _user._id);

      expect(article.title).toBe(doc.title);
      expect(article.summary).toBe(doc.summary);
      expect(article.content).toBe(doc.content);
      expect(article.icon).toBe(doc.icon);
      expect(article.status).toBe(PUBLISH_STATUSES.DRAFT);
    });

    test('update', async () => {
      const doc = {
        title: 'Test article title',
        summary: 'Test article description',
        content: 'Test article content',
        status: PUBLISH_STATUSES.DRAFT,
      };

      const article = await KnowledgeBaseArticles.createDoc(doc, _user._id);

      article.title = 'Test article title 2';
      article.summary = 'Test article description 2';
      article.content = 'Test article content 2';
      article.status = PUBLISH_STATUSES.PUBLISH;

      const updatedArticle = await KnowledgeBaseArticles.updateDoc(
        article._id,
        article.toObject(),
        _user._id,
      );

      expect(updatedArticle.title).toBe(article.title);
      expect(updatedArticle.summary).toBe(article.summary);
      expect(updatedArticle.content).toBe(article.content);
      expect(updatedArticle.icon).toBe(article.icon);
      expect(updatedArticle.status).toBe(article.status);
    });

    test('remove', async () => {
      const doc = {
        title: 'Test article title',
        summary: 'Test article description',
        content: 'Test article content',
        status: PUBLISH_STATUSES.DRAFT,
      };

      const article = await KnowledgeBaseArticles.createDoc(doc, _user._id);

      expect(await KnowledgeBaseArticles.find().count()).toBe(1);

      await KnowledgeBaseArticles.removeDoc(article._id);

      expect(await KnowledgeBaseArticles.find().count()).toBe(0);
    });
  });
});
