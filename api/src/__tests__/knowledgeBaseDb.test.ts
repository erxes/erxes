import * as toBeType from 'jest-tobetype';
import {
  brandFactory,
  knowledgeBaseArticleFactory,
  knowledgeBaseCategoryFactory,
  knowledgeBaseTopicFactory,
  userFactory
} from '../db/factories';
import {
  Brands,
  KnowledgeBaseArticles,
  KnowledgeBaseCategories,
  KnowledgeBaseTopics,
  Users
} from '../db/models';
import { PUBLISH_STATUSES } from '../db/models/definitions/constants';

import './setup.ts';

expect.extend(toBeType);

describe('test knowledge base models', () => {
  let _user;

  beforeAll(async () => {
    _user = await userFactory({});
  });

  afterAll(async () => {
    await Users.deleteMany({});
  });

  describe('Knowledge base topics', () => {
    afterEach(async () => {
      await KnowledgeBaseTopics.deleteMany({});
      await Brands.deleteMany({});
      await KnowledgeBaseCategories.deleteMany({});
    });

    test('Get knowledge base topic', async () => {
      const topic = await knowledgeBaseTopicFactory();

      try {
        await KnowledgeBaseTopics.getTopic('fakeId');
      } catch (e) {
        expect(e.message).toBe('Knowledge base topic not found');
      }

      const response = await KnowledgeBaseTopics.getTopic(topic._id);

      expect(response).toBeDefined();
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

    test('Create topic', async () => {
      const categoryA = await knowledgeBaseCategoryFactory({});
      const categoryB = await knowledgeBaseCategoryFactory({});
      const brand = await brandFactory({});

      const doc = {
        title: 'Test topic title',
        description: 'Test topic description',
        categoryIds: [categoryA._id, categoryB._id],
        brandId: brand._id
      };

      const topic = await KnowledgeBaseTopics.createDoc(doc, _user._id);

      expect(topic.title).toBe(doc.title);
      expect(topic.description).toBe(doc.description);
      expect(topic.categoryIds).toContain(categoryA._id);
      expect(topic.brandId).toBe(doc.brandId);
    });

    test('Update topic', async () => {
      const categoryA = await knowledgeBaseCategoryFactory({});
      const categoryB = await knowledgeBaseCategoryFactory({});

      const brandA = await brandFactory({});
      const brandB = await brandFactory({});

      const doc = {
        title: 'Test topic title',
        description: 'Test topic description',
        categoryIds: [categoryA._id, categoryB._id],
        brandId: brandA._id
      };

      const topic = await KnowledgeBaseTopics.createDoc(doc, _user._id);

      topic.title = 'Test topic title 2';
      topic.description = 'Test topic description 2';
      topic.categoryIds = [categoryA._id, categoryB._id];
      topic.brandId = brandB._id;

      const newTopic = await KnowledgeBaseTopics.updateDoc(
        topic._id,
        topic.toObject(),
        _user._id
      );

      expect(newTopic._id).toBe(topic._id);
      expect(newTopic.title).toBe(topic.title);
      expect(newTopic.categoryIds).toContain(categoryA._id);
      expect(newTopic.categoryIds).toContain(categoryB._id);
      expect(newTopic.brandId).toBe(brandB._id);
    });

    test('Remove topic', async () => {
      const categoryA = await knowledgeBaseCategoryFactory({});
      const categoryB = await knowledgeBaseCategoryFactory({});

      const brand = await brandFactory({});

      const doc = {
        title: 'Test topic title',
        description: 'Test topic description',
        brandId: brand._id,
        categoryIds: [categoryA._id, categoryB._id]
      };

      const topic = await KnowledgeBaseTopics.createDoc(doc, _user._id);

      expect(await KnowledgeBaseTopics.find().countDocuments()).toBe(1);

      await KnowledgeBaseTopics.removeDoc(topic._id);

      expect(await KnowledgeBaseTopics.find().countDocuments()).toBe(0);
      expect(await KnowledgeBaseCategories.find().countDocuments()).toBe(0);

      try {
        await KnowledgeBaseTopics.removeDoc('fakeId');
      } catch (e) {
        expect(e.message).toBe('Topic not found');
      }
    });
  });

  describe('Knowledge base categories', () => {
    afterEach(async () => {
      await KnowledgeBaseCategories.deleteMany({});
      await KnowledgeBaseArticles.deleteMany({});
    });

    test('Get knowledge base category', async () => {
      const category = await knowledgeBaseCategoryFactory();

      try {
        await KnowledgeBaseCategories.getCategory('fakeId');
      } catch (e) {
        expect(e.message).toBe('Knowledge base category not found');
      }

      const response = await KnowledgeBaseCategories.getCategory(category._id);

      expect(response).toBeDefined();
    });

    test(`check if Error('userId must be supplied') in create`, async () => {
      expect.assertions(1);

      try {
        await KnowledgeBaseCategories.createDoc({ topicIds: ['123'] });
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('Create category', async () => {
      const article = await knowledgeBaseArticleFactory({});

      const topicCategory = await knowledgeBaseCategoryFactory({
        articleIds: [article._id]
      });
      const topicA = await knowledgeBaseTopicFactory({
        categoryIds: [topicCategory._id]
      });
      const topicB = await knowledgeBaseTopicFactory({});

      const doc = {
        title: 'Test category title',
        description: 'Test category description',
        articleIds: [article._id],
        icon: 'test category icon',
        topicIds: [topicA._id.toString(), topicB._id.toString()]
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
        _id: topicA._id.toString()
      });
      const topicBObj = await KnowledgeBaseTopics.findOne({
        _id: topicB._id.toString()
      });

      if (
        !topicAObj ||
        !topicAObj.categoryIds ||
        !topicBObj ||
        !topicBObj.categoryIds
      ) {
        throw new Error('Topic not found');
      }

      expect(topicAObj.categoryIds.length).toBe(2);

      expect(topicBObj.categoryIds.length).toBe(1);
      expect(topicBObj.categoryIds[0]).toBe(category._id.toString());
    });

    test(`check if Error('userId must be supplied') in update`, async () => {
      expect.assertions(1);

      try {
        await KnowledgeBaseCategories.updateDoc('fakeId', {});
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('Update category', async () => {
      const article = await knowledgeBaseArticleFactory({});
      const articleB = await knowledgeBaseArticleFactory({});

      const doc = {
        title: 'Test category title',
        description: 'Test category description',
        articleIds: [article._id],
        icon: 'test icon'
      };

      const category = await KnowledgeBaseCategories.createDoc(doc, _user._id);

      category.title = 'Test category title 2';
      category.description = 'Test category description 2';
      category.articleIds = [article._id, articleB._id];
      category.icon = 'test icon 2';

      const topicA = await knowledgeBaseTopicFactory({
        categoryIds: [category._id]
      });
      const topicB = await knowledgeBaseTopicFactory({});

      const updatedCategory = await KnowledgeBaseCategories.updateDoc(
        category._id,
        {
          ...category.toObject(),
          topicIds: [topicA._id.toString(), topicB._id.toString()]
        },
        _user._id
      );

      expect(updatedCategory._id).toBe(category._id);
      expect(updatedCategory.title).toBe(category.title);
      expect(updatedCategory.description).toBe(category.description);
      expect(updatedCategory.articleIds).toContain(article._id);
      expect(updatedCategory.articleIds).toContain(articleB._id);
      expect(updatedCategory.icon).toBe(category.icon);

      // Values related to modification ======
      expect(updatedCategory.modifiedBy).toBe(_user._id);
      expect(updatedCategory.modifiedDate).toBeDefined();

      const topicAObj = await KnowledgeBaseTopics.findOne({
        _id: topicA._id.toString()
      });
      const topicBObj = await KnowledgeBaseTopics.findOne({
        _id: topicB._id.toString()
      });

      if (
        !topicAObj ||
        !topicAObj.categoryIds ||
        !topicBObj ||
        !topicBObj.categoryIds
      ) {
        throw new Error('Topic not found');
      }

      expect(topicAObj.categoryIds.length).toBe(1);
      expect(topicAObj.categoryIds[0]).toBe(updatedCategory._id.toString());

      expect(topicBObj.categoryIds.length).toBe(1);
      expect(topicBObj.categoryIds[0]).toBe(updatedCategory._id.toString());
    });

    test('update', async () => {
      const category = await KnowledgeBaseCategories.createDoc({}, _user._id);
      const updatedCategoryNoTopic = await KnowledgeBaseCategories.updateDoc(
        category._id,
        {},
        _user._id
      );

      const topics = await KnowledgeBaseTopics.find({
        categoryIds: [updatedCategoryNoTopic._id]
      });
      expect(topics).toHaveLength(0);
    });

    test('Remove category', async () => {
      const doc = {
        title: 'Test category title',
        description: 'Test category description',
        icon: 'test icon'
      };

      const category = await KnowledgeBaseCategories.createDoc(doc, _user._id);

      expect(await KnowledgeBaseCategories.find().countDocuments()).toBe(1);

      await KnowledgeBaseCategories.removeDoc(category._id);

      expect(await KnowledgeBaseCategories.find().countDocuments()).toBe(0);

      try {
        await KnowledgeBaseCategories.removeDoc('fakeId');
      } catch (e) {
        expect(e.message).toBe('Category not found');
      }
    });

    test('Remove with article', async () => {
      const article = await knowledgeBaseArticleFactory();

      const doc = {
        title: 'Test category title',
        description: 'Test category description',
        icon: 'test icon',
        articleIds: [article._id]
      };

      const category = await KnowledgeBaseCategories.createDoc(doc, _user._id);

      expect(await KnowledgeBaseCategories.find().countDocuments()).toBe(1);

      await KnowledgeBaseCategories.removeDoc(category._id);

      expect(await KnowledgeBaseCategories.find().countDocuments()).toBe(0);

      expect(await KnowledgeBaseArticles.find().countDocuments()).toBe(0);
    });
  });

  describe('Knowledge base articles', () => {
    afterEach(async () => {
      await KnowledgeBaseArticles.deleteMany({});
    });

    test('Get knowledge base article', async () => {
      const article = await knowledgeBaseArticleFactory();

      try {
        await KnowledgeBaseArticles.getArticle('fakeId');
      } catch (e) {
        expect(e.message).toBe('Knowledge base article not found');
      }

      const response = await KnowledgeBaseArticles.getArticle(article._id);

      expect(response).toBeDefined();
    });

    test(`check if Error('userId must be supplied') when creating`, async () => {
      expect.assertions(1);

      try {
        await KnowledgeBaseArticles.createDoc({ categoryIds: ['123'] });
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('Create article', async () => {
      const categoryA = await knowledgeBaseCategoryFactory({});
      const categoryB = await knowledgeBaseCategoryFactory({});

      const doc = {
        title: 'Test article title',
        summary: 'Test article description',
        content: 'Test article content',
        categoryIds: [categoryA._id.toString(), categoryB._id.toString()],
        status: PUBLISH_STATUSES.DRAFT
      };

      const article = await KnowledgeBaseArticles.createDoc(doc, _user._id);

      expect(article.title).toBe(doc.title);
      expect(article.summary).toBe(doc.summary);
      expect(article.content).toBe(doc.content);
      expect(article.status).toBe(PUBLISH_STATUSES.DRAFT);

      const categoryAObj = await KnowledgeBaseCategories.findOne({
        _id: categoryA._id.toString()
      });
      const categoryBObj = await KnowledgeBaseCategories.findOne({
        _id: categoryB._id.toString()
      });

      if (
        !categoryAObj ||
        !categoryAObj.articleIds ||
        !categoryBObj ||
        !categoryBObj.articleIds
      ) {
        throw new Error('Topic not found');
      }

      expect(categoryAObj.articleIds.length).toBe(1);
      expect(categoryAObj.articleIds[0]).toBe(article._id.toString());
      expect(categoryBObj.articleIds.length).toBe(1);
      expect(categoryBObj.articleIds[0]).toBe(article._id.toString());
    });

    test(`check if Error('userId must be supplied') when updating`, async () => {
      expect.assertions(1);

      try {
        await KnowledgeBaseArticles.updateDoc('fakeId', {});
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('Update article', async () => {
      const doc = {
        title: 'Test article title',
        summary: 'Test article description',
        content: 'Test article content',
        status: PUBLISH_STATUSES.DRAFT
      };

      const article = await KnowledgeBaseArticles.createDoc(doc, _user._id);

      article.title = 'Test article title 2';
      article.summary = 'Test article description 2';
      article.content = 'Test article content 2';
      article.status = PUBLISH_STATUSES.PUBLISH;

      const categoryA = await knowledgeBaseCategoryFactory({
        articleIds: [article._id]
      });
      const categoryB = await knowledgeBaseCategoryFactory({});

      let updatedArticle = await KnowledgeBaseArticles.updateDoc(
        article._id,
        {
          ...article.toObject(),
          categoryIds: [categoryA._id.toString(), categoryB._id.toString()]
        },
        _user._id
      );

      const categoryAObj = await KnowledgeBaseCategories.findOne({
        _id: categoryA._id.toString()
      });
      const categoryBObj = await KnowledgeBaseCategories.findOne({
        _id: categoryB._id.toString()
      });

      if (
        !categoryAObj ||
        !categoryAObj.articleIds ||
        !categoryBObj ||
        !categoryBObj.articleIds
      ) {
        throw new Error('Topic not found');
      }

      expect(updatedArticle.title).toBe(article.title);
      expect(updatedArticle.summary).toBe(article.summary);
      expect(updatedArticle.content).toBe(article.content);
      expect(updatedArticle.status).toBe(article.status);

      expect(categoryAObj.articleIds.length).toBe(1);
      expect(categoryAObj.articleIds[0]).toBe(article._id.toString());

      expect(categoryBObj.articleIds.length).toBe(1);
      expect(categoryBObj.articleIds[0]).toBe(article._id.toString());

      const articleNoCategory = await knowledgeBaseArticleFactory();
      updatedArticle = await KnowledgeBaseArticles.updateDoc(
        articleNoCategory._id,
        {},
        _user._id
      );

      const cats = await KnowledgeBaseCategories.find({
        articleIds: { $in: [articleNoCategory._id] }
      });

      expect(cats).toHaveLength(0);
    });

    test('Remove article', async () => {
      const doc = {
        title: 'Test article title',
        summary: 'Test article description',
        content: 'Test article content',
        status: PUBLISH_STATUSES.DRAFT
      };

      const article = await KnowledgeBaseArticles.createDoc(doc, _user._id);

      expect(await KnowledgeBaseArticles.find().countDocuments()).toBe(1);

      await KnowledgeBaseArticles.removeDoc(article._id);

      expect(await KnowledgeBaseArticles.find().countDocuments()).toBe(0);
    });

    test('Article: incReactionCount', async () => {
      try {
        await KnowledgeBaseArticles.incReactionCount('_id', 'wow');
      } catch (e) {
        expect(e.message).toBe('Article not found');
      }

      const article = await knowledgeBaseArticleFactory({
        reactionChoices: ['wow']
      });

      await KnowledgeBaseArticles.incReactionCount(article._id, 'wow');

      const updated =
        (await KnowledgeBaseArticles.findOne({ _id: article._id })) ||
        ({ reactionCounts: {} } as any);

      expect(updated.reactionCounts.wow).toBe(1);
    });
  });
});
