import * as toBeType from 'jest-tobetype';
import { PUBLISH_STATUSES } from '../data/constants';
import { connect, disconnect } from '../db/connection';
import {
  brandFactory,
  knowledgeBaseArticleFactory,
  knowledgeBaseCategoryFactory,
  knowledgeBaseTopicFactory,
  userFactory,
} from '../db/factories';
import { Brands, KnowledgeBaseArticles, KnowledgeBaseCategories, KnowledgeBaseTopics, Users } from '../db/models';

expect.extend(toBeType);

beforeAll(() => connect());
afterAll(() => disconnect());

describe('test knowledge base models', () => {
  let _user;

  beforeAll(async () => {
    _user = await userFactory({});
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

    test(`check if Error('userId must be supplied')
    is being called as intended on create method`, () => {
      expect.assertions(1);

      try {
        KnowledgeBaseTopics.createDoc({});
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test(`check if Error('userId must be supplied')
     is being called as intended on update method`, async () => {
      expect.assertions(1);

      try {
        await KnowledgeBaseTopics.updateDoc('fakeId', {});
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('create', async () => {
      const categoryA = await knowledgeBaseCategoryFactory({});
      const categoryB = await knowledgeBaseCategoryFactory({});
      const brand = await brandFactory({});

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
      const categoryA = await knowledgeBaseCategoryFactory({});
      const categoryB = await knowledgeBaseCategoryFactory({});

      const brand = await brandFactory({});

      const doc = {
        title: 'Test topic title',
        description: 'Test topic description',
        brandId: brand._id,
        categoryIds: [categoryA._id, categoryB._id],
      };

      const topic = await KnowledgeBaseTopics.createDoc(doc, _user._id);

      expect(await KnowledgeBaseTopics.find().count()).toBe(1);

      await KnowledgeBaseTopics.removeDoc(topic._id);

      expect(await KnowledgeBaseTopics.find().count()).toBe(0);
      expect(await KnowledgeBaseCategories.find().count()).toBe(0);
    });
  });

  describe('KnowledgeBaseCategories', () => {
    afterEach(async () => {
      await KnowledgeBaseCategories.remove({});
      await KnowledgeBaseArticles.remove({});
    });

    test(`expect Error('userId must be supplied') to be called as intended`, async () => {
      expect.assertions(1);

      try {
        await KnowledgeBaseCategories.createDoc({ topicIds: ['123'] });
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('create', async () => {
      const article = await knowledgeBaseArticleFactory({});

      const topicA = await knowledgeBaseTopicFactory({});
      const topicB = await knowledgeBaseTopicFactory({});

      const doc = {
        title: 'Test category title',
        description: 'Test category description',
        articleIds: [article._id],
        icon: 'test category icon',
        topicIds: [topicA._id.toString(), topicB._id.toString()],
      };

      const category = await KnowledgeBaseCategories.createDoc(doc, _user._id);

      expect(category.title).toBe(doc.title);
      expect(category.description).toBe(doc.description);
      expect(category.articleIds).toContain(article._id);
      expect(category.icon).toBe(doc.icon);
      // Values related to modification ======
      expect(category.createdBy).toBe(_user._id);
      expect(category.createdDate).toBeDefined();

      const topicAObj = await KnowledgeBaseTopics.findOne({
        _id: topicA._id.toString(),
      });
      const topicBObj = await KnowledgeBaseTopics.findOne({
        _id: topicB._id.toString(),
      });

      if (!topicAObj || !topicAObj.categoryIds || (!topicBObj || !topicBObj.categoryIds)) {
        throw new Error('Topic not found');
      }

      expect(topicAObj.categoryIds.length).toBe(1);
      expect(topicAObj.categoryIds[0]).toBe(category._id.toString());

      expect(topicBObj.categoryIds.length).toBe(1);
      expect(topicBObj.categoryIds[0]).toBe(category._id.toString());
    });

    test('update', async () => {
      const article = await knowledgeBaseArticleFactory({});
      const articleB = await knowledgeBaseArticleFactory({});

      const topicA = await knowledgeBaseTopicFactory({});
      const topicB = await knowledgeBaseTopicFactory({});

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
        {
          ...category.toObject(),
          topicIds: [topicA._id.toString(), topicB._id.toString()],
        },
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
      expect(newCategory.modifiedDate).toBeDefined();

      const topicAObj = await KnowledgeBaseTopics.findOne({
        _id: topicA._id.toString(),
      });
      const topicBObj = await KnowledgeBaseTopics.findOne({
        _id: topicB._id.toString(),
      });

      if (!topicAObj || !topicAObj.categoryIds || (!topicBObj || !topicBObj.categoryIds)) {
        throw new Error('Topic not found');
      }

      expect(topicAObj.categoryIds.length).toBe(1);
      expect(topicAObj.categoryIds[0]).toBe(newCategory._id.toString());

      expect(topicBObj.categoryIds.length).toBe(1);
      expect(topicBObj.categoryIds[0]).toBe(newCategory._id.toString());
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

    test(`expect Error('userId must be supplied') to be called as intended`, async () => {
      expect.assertions(1);

      try {
        await KnowledgeBaseArticles.createDoc({ categoryIds: ['123'] });
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('create', async () => {
      const categoryA = await knowledgeBaseCategoryFactory({});
      const categoryB = await knowledgeBaseCategoryFactory({});

      const doc = {
        title: 'Test article title',
        summary: 'Test article description',
        content: 'Test article content',
        categoryIds: [categoryA._id.toString(), categoryB._id.toString()],
        status: PUBLISH_STATUSES.DRAFT,
      };

      const article = await KnowledgeBaseArticles.createDoc(doc, _user._id);

      expect(article.title).toBe(doc.title);
      expect(article.summary).toBe(doc.summary);
      expect(article.content).toBe(doc.content);
      expect(article.status).toBe(PUBLISH_STATUSES.DRAFT);

      const categoryAObj = await KnowledgeBaseCategories.findOne({
        _id: categoryA._id.toString(),
      });
      const categoryBObj = await KnowledgeBaseCategories.findOne({
        _id: categoryB._id.toString(),
      });

      if (!categoryAObj || !categoryAObj.articleIds || (!categoryBObj || !categoryBObj.articleIds)) {
        throw new Error('Topic not found');
      }

      expect(categoryAObj.articleIds.length).toBe(3);
      expect(categoryAObj.articleIds[2]).toBe(article._id.toString());
      expect(categoryBObj.articleIds.length).toBe(3);
      expect(categoryBObj.articleIds[2]).toBe(article._id.toString());
    });

    test('update', async () => {
      const categoryA = await knowledgeBaseCategoryFactory({ articleIds: [] });
      const categoryB = await knowledgeBaseCategoryFactory({});

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
        {
          ...article.toObject(),
          categoryIds: [categoryA._id.toString(), categoryB._id.toString()],
        },
        _user._id,
      );

      const categoryAObj = await KnowledgeBaseCategories.findOne({
        _id: categoryA._id.toString(),
      });
      const categoryBObj = await KnowledgeBaseCategories.findOne({
        _id: categoryB._id.toString(),
      });

      if (!categoryAObj || !categoryAObj.articleIds || (!categoryBObj || !categoryBObj.articleIds)) {
        throw new Error('Topic not found');
      }

      expect(updatedArticle.title).toBe(article.title);
      expect(updatedArticle.summary).toBe(article.summary);
      expect(updatedArticle.content).toBe(article.content);
      expect(updatedArticle.status).toBe(article.status);

      expect(categoryAObj.articleIds.length).toBe(1);
      expect(categoryAObj.articleIds[0]).toBe(article._id.toString());

      expect(categoryBObj.articleIds.length).toBe(3);
      expect(categoryBObj.articleIds[2]).toBe(article._id.toString());
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
