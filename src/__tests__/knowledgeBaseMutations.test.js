/* eslint-env jest */
/* eslint-disable no-underscore-dangle */

import knowledgeBaseMutations from '../data/resolvers/mutations/knowledgeBase';
import { KnowledgeBaseTopics, KnowledgeBaseCategories, KnowledgeBaseArticles } from '../db/models';

describe('mutations', () => {
  let _user = {
    _id: 'fakeUserId',
  };

  test(`test if Error('Login required') error is working as intended`, async () => {
    expect.assertions(9);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(knowledgeBaseMutations.topicsAdd);
    expectError(knowledgeBaseMutations.topicsEdit);
    expectError(knowledgeBaseMutations.topicsRemove);

    expectError(knowledgeBaseMutations.categoriesAdd);
    expectError(knowledgeBaseMutations.categoriesEdit);
    expectError(knowledgeBaseMutations.categoriesRemove);

    expectError(knowledgeBaseMutations.articlesAdd);
    expectError(knowledgeBaseMutations.articlesEdit);
    expectError(knowledgeBaseMutations.articlesRemove);
  });

  describe('topic mutaions', () => {
    test('topicsAdd', () => {
      KnowledgeBaseTopics.createDoc = jest.fn();

      const doc = {
        title: 'Test topic title',
        description: 'Test topic description',
        categoryIds: ['fakeCategoryId'],
        brandId: 'fakeBrandId',
      };

      knowledgeBaseMutations.topicsAdd(null, doc, { user: _user });

      expect(KnowledgeBaseTopics.createDoc).toBeCalledWith(doc, _user._id);
      expect(KnowledgeBaseTopics.createDoc.mock.calls.length).toBe(1);

      KnowledgeBaseTopics.createDoc.mockRestore();
    });

    test('topicsEdit', () => {
      KnowledgeBaseTopics.updateDoc = jest.fn();

      const doc = {
        title: 'Test topic title',
        description: 'Test topic description',
        categoryIds: ['fakeCategoryId'],
        brandId: 'fakeBrandId',
      };

      const updateDoc = {
        _id: 'fakeTopicId',
        ...doc,
      };

      knowledgeBaseMutations.topicsEdit(null, updateDoc, { user: _user });

      expect(KnowledgeBaseTopics.updateDoc).toBeCalledWith(updateDoc._id, doc, _user._id);
      expect(KnowledgeBaseTopics.updateDoc.mock.calls.length).toBe(1);

      KnowledgeBaseTopics.updateDoc.mockRestore();
    });

    test('topicsRemove', () => {
      KnowledgeBaseTopics.removeDoc = jest.fn();

      const fakeTopicId = 'fakeTopicId';

      knowledgeBaseMutations.topicsRemove(null, { _id: fakeTopicId }, { user: _user });

      expect(KnowledgeBaseTopics.removeDoc).toBeCalledWith(fakeTopicId);
      expect(KnowledgeBaseTopics.removeDoc.mock.calls.length).toBe(1);

      KnowledgeBaseTopics.removeDoc.mockRestore();
    });
  });

  describe('category mutaions', () => {
    test('categoriesAdd', () => {
      KnowledgeBaseCategories.createDoc = jest.fn();

      const doc = {
        title: 'Test topic title',
        description: 'Test topic description',
        categoryIds: ['fakeCategoryId'],
        brandId: 'fakeBrandId',
      };

      knowledgeBaseMutations.categoriesAdd(null, doc, { user: _user });

      expect(KnowledgeBaseCategories.createDoc).toBeCalledWith(doc, _user._id);
      expect(KnowledgeBaseCategories.createDoc.mock.calls.length).toBe(1);

      KnowledgeBaseCategories.createDoc.mockRestore();
    });

    test('categoriesEdit', () => {
      KnowledgeBaseCategories.updateDoc = jest.fn();

      const doc = {
        title: 'Test category title',
        description: 'Test category description',
        articles: ['fakeArticleId'],
        icon: 'fake icon',
      };

      const updateDoc = {
        _id: 'fakeCategoryId',
        ...doc,
      };

      knowledgeBaseMutations.categoriesEdit(null, updateDoc, { user: _user });

      expect(KnowledgeBaseCategories.updateDoc).toBeCalledWith(updateDoc._id, doc, _user._id);
      expect(KnowledgeBaseCategories.updateDoc.mock.calls.length).toBe(1);

      KnowledgeBaseCategories.updateDoc.mockRestore();
    });

    test('categoriesRemove', () => {
      KnowledgeBaseCategories.removeDoc = jest.fn();

      const fakeCategoryId = 'fakeCategoryId';

      knowledgeBaseMutations.categoriesRemove(null, { _id: fakeCategoryId }, { user: _user });

      expect(KnowledgeBaseCategories.removeDoc).toBeCalledWith(fakeCategoryId);
      expect(KnowledgeBaseCategories.removeDoc.mock.calls.length).toBe(1);

      KnowledgeBaseCategories.removeDoc.mockRestore();
    });
  });

  describe('article mutations', () => {
    test('articlesAdd', () => {
      KnowledgeBaseArticles.createDoc = jest.fn();

      const doc = {
        title: 'Test article title',
        summary: 'Test article summary',
        content: 'Test article content',
        status: 'Test article status',
      };

      knowledgeBaseMutations.articlesAdd(null, doc, { user: _user });

      expect(KnowledgeBaseArticles.createDoc).toBeCalledWith(doc, _user._id);
      expect(KnowledgeBaseArticles.createDoc.mock.calls.length).toBe(1);

      KnowledgeBaseArticles.createDoc.mockRestore();
    });

    test('articlesEdit', () => {
      KnowledgeBaseArticles.updateDoc = jest.fn();

      const doc = {
        title: 'Test article title',
        summary: 'Test article summary',
        content: 'Test article content',
        status: 'Test article status',
      };

      const updateDoc = {
        _id: 'fakeArticleId',
        ...doc,
      };

      knowledgeBaseMutations.articlesEdit(null, updateDoc, { user: _user });

      expect(KnowledgeBaseArticles.updateDoc).toBeCalledWith(updateDoc._id, doc, _user._id);
      expect(KnowledgeBaseArticles.updateDoc.mock.calls.length).toBe(1);

      KnowledgeBaseArticles.updateDoc.mockRestore();
    });

    test('articlesRemove', () => {
      KnowledgeBaseArticles.removeDoc = jest.fn();

      const fakeArticleId = 'fakeArticleId';

      knowledgeBaseMutations.articlesRemove(null, { _id: fakeArticleId }, { user: _user });

      expect(KnowledgeBaseArticles.removeDoc).toBeCalledWith(fakeArticleId);
      expect(KnowledgeBaseArticles.removeDoc.mock.calls.length).toBe(1);

      KnowledgeBaseArticles.removeDoc.mockRestore();
    });
  });
});
