/* eslint-env jest */

import knowledgeBaseQueries from '../data/resolvers/queries/knowledgeBase';

describe('knowledgeBaseQueries', () => {
  test(`test if Error('Login required') error is working as intended`, async () => {
    expect.assertions(9);

    const expectError = async func => {
      try {
        await func(null, {}, {});
      } catch (e) {
        expect(e.message).toBe('Login required');
      }
    };

    expectError(knowledgeBaseQueries.knowledgeBaseArticles);
    expectError(knowledgeBaseQueries.knowledgeBaseArticlesDetail);
    expectError(knowledgeBaseQueries.knowledgeBaseArticlesTotalCount);

    expectError(knowledgeBaseQueries.knowledgeBaseCategories);
    expectError(knowledgeBaseQueries.knowledgeBaseCategoriesDetail);
    expectError(knowledgeBaseQueries.knowledgeBaseCategoriesTotalCount);

    expectError(knowledgeBaseQueries.knowledgeBaseTopics);
    expectError(knowledgeBaseQueries.knowledgeBaseTopicsDetail);
    expectError(knowledgeBaseQueries.knowledgeBaseTopicsTotalCount);
  });
});
