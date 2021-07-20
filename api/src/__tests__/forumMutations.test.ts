import * as faker from 'faker';
import { graphqlRequest } from '../db/connection';
import {
  Brands,
  Users,
  Forums,
  ForumTopics,
  ForumDiscussions,
  DiscussionComments
} from '../db/models';
import { FORUM_DISCUSSION_STATUSES } from '../db/models/definitions/constants';
import {
  brandFactory,
  forumFactory,
  forumTopicFactory,
  forumDiscussionFactory,
  discussionCommentFactory
} from '../db/factories';

import './setup.ts';

/*
 * Generated test data
 */
const forumArgs = {
  title: faker.random.word(),
  description: faker.random.word(),
  languageCode: 'en'
};

const topicArgs = {
  title: faker.random.word(),
  description: faker.random.word()
};

const discussionArgs = {
  title: faker.random.word(),
  description: faker.random.word(),
  status: FORUM_DISCUSSION_STATUSES.PUBLISH,
  content: faker.random.word()
};

const commentArgs = {
  title: faker.random.word(),
  content: faker.random.word()
};

describe('mutations', () => {
  let _forum;
  let _forumTopic;
  let _forumDiscussion;
  let _discussionComment;
  let _brand;

  beforeEach(async () => {
    // Creating test data
    _forum = await forumFactory({});
    _forumTopic = await forumTopicFactory({
      forumId: _forum._id
    });
    _forumDiscussion = await forumDiscussionFactory({
      status: FORUM_DISCUSSION_STATUSES.CLOSED,
      forumId: _forum._id,
      topicId: _forumTopic._id
    });
    _discussionComment = await discussionCommentFactory({
      discussionId: _forumDiscussion._id
    });
    _brand = await brandFactory({});
  });

  afterEach(async () => {
    // Clearing test data
    await Forums.deleteMany({});
    await ForumTopics.deleteMany({});
    await ForumDiscussions.deleteMany({});
    await DiscussionComments.deleteMany({});
    await Users.deleteMany({});
    await Brands.deleteMany({});
  });

  test('Add forum', async () => {
    const doc = {
      brandId: _brand._id,
      ...forumArgs
    };

    const mutation = `
      mutation forumsAdd($title: String $description: String $languageCode: String $brandId: String!){
        forumsAdd(title: $title description: $description languageCode: $languageCode brandId: $brandId){
          title
          description
          languageCode
          brand{
            _id
          }
          topics{
            _id
          }
        }
      }
    `;

    const forum = await graphqlRequest(mutation, 'forumsAdd', doc);

    expect(forum.title).toBe(doc.title);
    expect(forum.description).toBe(doc.description);
    expect(forum.brand._id).toBe(doc.brandId);
    expect(forum.languageCode).toBe(doc.languageCode);
  });

  test('Edit forum', async () => {
    const doc = {
      _id: _forum._id,
      brandId: _brand._id,
      ...forumArgs
    };

    const mutation = `
      mutation forumsEdit($_id: String! $title: String $description: String $languageCode: String $brandId: String!){
        forumsEdit(_id: $_id title: $title description: $description languageCode: $languageCode brandId: $brandId){
          _id
          title
          description
          languageCode
          brand{
            _id
          }
          topics{
            _id
          }
        }
      }
    `;
    const forum = await graphqlRequest(mutation, 'forumsEdit', doc);

    expect(forum._id).toBe(_forum._id);
    expect(forum.title).toBe(doc.title);
    expect(forum.description).toBe(doc.description);
    expect(forum.brand._id).toBe(doc.brandId);
    expect(forum.languageCode).toBe(doc.languageCode);
  });

  test('Remove forum', async () => {
    const _id = _forum._id;

    const mutation = `
      mutation forumsRemove($_id: String!){
        forumsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'forumsRemove', { _id });

    expect(await Forums.findOne({ _id })).toBe(null);
  });

  test('Add forum topic', async () => {
    const doc = {
      forumId: _forum._id,
      ...topicArgs
    };

    const mutation = `
      mutation forumTopicsAdd($title: String $description: String $forumId: String){
        forumTopicsAdd(title: $title description: $description forumId: $forumId){
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

    const forumTopic = await graphqlRequest(mutation, 'forumTopicsAdd', doc);

    expect(forumTopic.title).toBe(doc.title);
    expect(forumTopic.description).toBe(doc.description);
  });

  test('Edit forum topic', async () => {
    const doc = {
      _id: _forumTopic._id,
      forumId: _forum._id,
      ...topicArgs
    };

    const mutation = `
      mutation forumTopicsEdit($_id: String! $title: String $description: String $forumId: String){
        forumTopicsEdit(_id: $_id title: $title description: $description forumId: $forumId){
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

    const forumTopic = await graphqlRequest(mutation, 'forumTopicsEdit', doc);

    expect(forumTopic._id).toBe(_forumTopic._id);
    expect(forumTopic.title).toBe(doc.title);
    expect(forumTopic.description).toBe(doc.description);
  });

  test('Remove forum topic', async () => {
    const _id = _forumTopic._id;

    const mutation = `
      mutation forumTopicsRemove($_id: String!){
        forumTopicsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'forumTopicsRemove', { _id });

    expect(await ForumTopics.findOne({ _id })).toBe(null);
  });

  test('Add forum discussion', async () => {
    const doc = {
      forumId: _forum._id,
      topicId: _forumTopic._id,
      ...discussionArgs
    };

    const mutation = `
      mutation forumDiscussionsAdd($title: String $description: String $content: String! $forumId: String! $topicId: String!){
        forumDiscussionsAdd(title: $title description: $description content: $content forumId: $forumId topicId: $topicId){
          _id
          title
          description
          content
        }
      }
    `;

    const discussion = await graphqlRequest(
      mutation,
      'forumDiscussionsAdd',
      doc
    );

    expect(discussion.title).toBe(doc.title);
    expect(discussion.description).toBe(doc.description);
    expect(discussion.content).toBe(doc.content);
  });

  test('Edit forum discussion', async () => {
    const doc = {
      _id: _forumDiscussion._id,
      forumId: _forum._id,
      topicId: _forumTopic._id,
      ...discussionArgs
    };

    const mutation = `
      mutation forumDiscussionsEdit($_id: String! $title: String $description: String $content: String! $forumId: String! $topicId: String!){
        forumDiscussionsEdit(_id: $_id title: $title description: $description content: $content forumId: $forumId topicId: $topicId){
          _id
          title
          description
          content
        }
      }
    `;

    const discussion = await graphqlRequest(
      mutation,
      'forumDiscussionsEdit',
      doc
    );

    expect(discussion._id).toBe(_forumDiscussion._id);
    expect(discussion.title).toBe(doc.title);
    expect(discussion.description).toBe(doc.description);
    expect(discussion.content).toBe(doc.content);
  });

  test('Remove forum discussion', async () => {
    const _id = _forumDiscussion._id;

    const mutation = `
      mutation forumDiscussionsRemove($_id: String!){
        forumDiscussionsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'forumDiscussionsRemove', { _id });

    expect(await ForumDiscussions.findOne({ _id })).toBe(null);
  });

  test('Add discussion comment', async () => {
    const doc = {
      discussionId: _forumDiscussion._id,
      ...commentArgs
    };

    const mutation = `
      mutation discussionCommentsAdd($title: String $content: String $discussionId: String!){
        discussionCommentsAdd(title: $title content: $content discussionId: $discussionId){
          _id
          title
          content
        }
      }
    `;

    const comment = await graphqlRequest(
      mutation,
      'discussionCommentsAdd',
      doc
    );

    expect(comment.title).toBe(doc.title);
    expect(comment.content).toBe(doc.content);
  });

  test('Edit discussion comment', async () => {
    const doc = {
      _id: _discussionComment._id,
      discussionId: _forumDiscussion._id,
      ...commentArgs
    };

    const mutation = `
      mutation discussionCommentsEdit($_id: String! $title: String $content: String $discussionId: String!){
        discussionCommentsEdit(_id: $_id title: $title content: $content discussionId: $discussionId){
          _id
          title
          content
        }
      } 
    `;

    const comment = await graphqlRequest(
      mutation,
      'discussionCommentsEdit',
      doc
    );

    expect(comment._id).toBe(_discussionComment._id);
    expect(comment.title).toBe(doc.title);
    expect(comment.content).toBe(doc.content);
  });

  test('Remove discussion comment', async () => {
    const _id = _discussionComment._id;

    const mutation = `
      mutation discussionCommentsRemove($_id: String!){
        discussionCommentsRemove(_id: $_id)
      }
    `;

    await graphqlRequest(mutation, 'discussionCommentsRemove', { _id });

    expect(await DiscussionComments.findOne({ _id })).toBe(null);
  });
});
