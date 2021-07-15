import { graphqlRequest } from '../db/connection';
import {
  discussionCommentFactory,
  forumDiscussionFactory,
  forumFactory,
  forumTopicFactory,
  knowledgeBaseArticleFactory,
  knowledgeBaseCategoryFactory,
  knowledgeBaseTopicFactory,
  userFactory
} from '../db/factories';
import {
  DiscussionComments,
  ForumDiscussions,
  Forums,
  ForumTopics
} from '../db/models';

import './setup.ts';

describe('forumQueries', () => {
  afterEach(async () => {
    // Clearing test data
    await Forums.deleteMany({});
    await ForumTopics.deleteMany({});
    await ForumDiscussions.deleteMany({});
    await DiscussionComments.deleteMany({});
  });

  test('Forums', async () => {
    await forumFactory();
    await forumFactory();
    await forumFactory();

    const qry = `
        query forums($page: Int $perPage: Int){
            forums(page: $page perPage: $perPage){
                _id
            }
        }
      `;

    const response = await graphqlRequest(qry, 'forums', {
      page: 1,
      perPage: 2
    });

    expect(response.length).toBe(2);
  });

  test('Forum detail', async () => {
    const forum = await forumFactory();

    const qry = `
        query forumDetail($_id: String!){
            forumDetail(_id: $_id){
                _id
            }
        }
      `;

    const response = await graphqlRequest(qry, 'forumDetail', {
      _id: forum._id
    });

    expect(forum._id).toBe(response._id);
  });

  test('Get forums total count', async () => {
    await forumFactory();
    await forumFactory();
    await forumFactory();

    const qry = `
        query forumsTotalCount{
            forumsTotalCount
        }
      `;

    const response = await graphqlRequest(qry, 'forumsTotalCount');

    expect(response).toBe(3);
  });

  test('Forum topics', async () => {
    const forum = await forumFactory();

    await forumTopicFactory({
      forumId: forum._id
    });

    await forumTopicFactory({
      forumId: forum._id
    });

    const args = {
      forumId: forum._id,
      page: 1,
      perPage: 5
    };

    const qry = `
        query forumTopics($page: Int $perPage: Int $forumId: String!){
            forumTopics(page: $page perPage: $perPage forumId: $forumId){
                _id
                title
                description
                forum{
                    _id
                }
                discussions{
                    _id
                }
            }
        }
    `;

    let response = await graphqlRequest(qry, 'forumTopics', args);

    expect(response.length).toBe(2);
  });

  test('Forum topic detail', async () => {
    const forum = await forumFactory();

    const topic = await forumTopicFactory({ forumId: forum._id });

    const qry = `
        query forumTopicDetail($_id: String!){
            forumTopicDetail(_id: $_id){
                _id
                title
                description
                forum{
                    _id
                }
                discussions{
                    _id
                }
            }
        }
    `;

    const response = await graphqlRequest(qry, 'forumTopicDetail', {
      _id: topic._id
    });

    expect(topic._id).toBe(response._id);
  });

  test('Forum topic total count', async () => {
    const forum = await forumFactory();

    await forumTopicFactory({ forumId: forum._id });
    await forumTopicFactory({ forumId: forum._id });
    await forumTopicFactory({ forumId: forum._id });

    const qry = `
        query forumTopicsTotalCount($forumId: String!){
            forumTopicsTotalCount(forumId: $forumId)
        }
    `;

    const response = await graphqlRequest(qry, 'forumTopicsTotalCount', {
      forumId: forum._id
    });

    expect(response).toBe(3);
  });

  test('Forum topic get last', async () => {
    const forum = await forumFactory();
    const topic = await forumTopicFactory({ forumId: forum._id });

    const qry = `
        query forumTopicsGetLast{
            forumTopicsGetLast{
                _id
                title
                description
                forum{
                    _id
                }
                discussions{
                    _id
                }
            }
        }
    `;

    const response = await graphqlRequest(qry, 'forumTopicsGetLast');

    expect(topic._id).toBe(response._id);
  });

  test('Forum discussions', async () => {
    const topic = await forumTopicFactory();

    await forumDiscussionFactory({ topicId: topic._id });
    await forumDiscussionFactory({ topicId: topic._id });
    await forumDiscussionFactory({ topicId: topic._id });

    const qry = `
        query forumDiscussions($page: Int $perPage: Int $topicId: String!){
            forumDiscussions(page: $page perPage: $perPage topicId: $topicId){
                _id
                title
                description
                status
                content
            }
        }
    `;

    const response = await graphqlRequest(qry, 'forumDiscussions', {
      topicId: topic._id,
      page: 1,
      perPage: 2
    });

    expect(response.length).toBe(2);
  });

  test('Forum discussion detail', async () => {
    const topic = await forumTopicFactory();

    const discussion = await forumDiscussionFactory({ topicId: topic._id });

    const qry = `
        query forumDiscussionDetail($_id: String!){
            forumDiscussionDetail(_id: $_id){
                _id
                title
                description
                status
                content
            }
        }
    `;

    const response = await graphqlRequest(qry, 'forumDiscussionDetail', {
      _id: discussion._id
    });

    expect(discussion._id).toBe(response._id);
  });

  test('Forum discussion total count', async () => {
    const topic = await forumTopicFactory();

    await forumDiscussionFactory({ topicId: topic._id });
    await forumDiscussionFactory({ topicId: topic._id });
    await forumDiscussionFactory({ topicId: topic._id });

    const qry = `
        query forumDiscussionsTotalCount($topicId: String!){
            forumDiscussionsTotalCount(topicId: $topicId)
        }
    `;

    const response = await graphqlRequest(qry, 'forumDiscussionsTotalCount', {
      topicId: topic._id
    });

    expect(response).toBe(3);
  });

  test('Discussion comments', async () => {
    const discussion = await forumDiscussionFactory();

    await discussionCommentFactory({ discussionId: discussion._id });
    await discussionCommentFactory({ discussionId: discussion._id });
    await discussionCommentFactory({ discussionId: discussion._id });

    const qry = `
        query discussionComments($discussionId: String!){
            discussionComments(discussionId: $discussionId){
                _id
                title
                content
            }
        }
    `;

    const response = await graphqlRequest(qry, 'discussionComments', {
      discussionId: discussion._id
    });

    expect(response.length).toBe(3);
  });

  test('Discussion comments total count', async () => {
    const discussion = await forumDiscussionFactory();

    await discussionCommentFactory({ discussionId: discussion._id });
    await discussionCommentFactory({ discussionId: discussion._id });
    await discussionCommentFactory({ discussionId: discussion._id });

    const qry = `
        query discussionCommentsTotalCount($discussionId: String!){
            discussionCommentsTotalCount(discussionId: $discussionId)
        }
    `;

    const response = await graphqlRequest(qry, 'discussionCommentsTotalCount', {
      discussionId: discussion._id
    });

    expect(response).toBe(3);
  });
});
