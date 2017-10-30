/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import { connect, disconnect } from '../db/connection';
import { knowledgeBaseCategoryFactory, brandFactory, userFactory } from '../db/factories';
import { KnowledgeBaseTopics, KnowledgeBaseCategories, Brands } from '../db/models';

beforeAll(() => connect());
afterAll(() => disconnect());

describe('test knowledge base models', () => {
  describe('topics', () => {
    let _user;

    beforeAll(async () => {
      _user = await userFactory();
    });

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

    test('create topic', async () => {
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

    test('update topic', async () => {
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

    test('remove topic', async () => {
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
});
