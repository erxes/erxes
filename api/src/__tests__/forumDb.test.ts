import * as toBeType from 'jest-tobetype';

import './setup.ts';

import {
  brandFactory,
  forumFactory,
  forumTopicFactory,
  forumDiscussionFactory,
  userFactory,
  discussionCommentFactory
} from '../db/factories';
import {
  Users,
  ForumTopics,
  ForumDiscussions,
  Brands,
  Forums,
  DiscussionComments,
  ForumReactions
} from '../db/models';
import { FORUM_DISCUSSION_STATUSES } from '../db/models/definitions/constants';

expect.extend(toBeType);

describe('test forum models', () => {
  let _user;

  beforeAll(async () => {
    _user = await userFactory({});
  });

  afterAll(async () => {
    await Users.deleteMany({});
  });

  describe('Forums', () => {
    afterEach(async () => {
      await Brands.deleteMany({});
      await Forums.deleteMany({});
      await ForumTopics.deleteMany({});
    });

    test('Get forum', async () => {
      const forum = await forumFactory();

      try {
        await Forums.getForum('fakeId');
      } catch (e) {
        expect(e.message).toBe('Forum not found');
      }

      const response = await Forums.getForum(forum._id);

      expect(response).toBeDefined();
    });

    test(`check if Error('userId must be supplied')
    is being called as intended on create method`, async () => {
      expect.assertions(1);

      try {
        await Forums.createDoc({});
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('Create forum', async () => {
      const brand = await brandFactory({});

      const doc = {
        title: 'Test forum title',
        description: 'Test forum description',
        brandId: brand._id
      };

      const forum = await Forums.createDoc(doc, _user._id);

      expect(forum.title).toBe(doc.title);
      expect(forum.description).toBe(doc.description);
      expect(forum.brandId).toBe(doc.brandId);
    });

    test(`check if Error('userId must be supplied')
     is being called as intended on update method`, async () => {
      expect.assertions(1);

      try {
        await Forums.updateDoc('fakeId', {});
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('Update forum', async () => {
      const brandA = await brandFactory({});
      const brandB = await brandFactory({});

      const doc = {
        title: 'Test forum title',
        description: 'Test forum description',
        brandId: brandA._id
      };

      const forum = await Forums.createDoc(doc, _user._id);

      forum.title = 'Test forum title 2';
      forum.description = 'Test forum description 2';
      forum.brandId = brandB._id;

      const newTopic = await Forums.updateDoc(
        forum._id,
        forum.toObject(),
        _user._id
      );

      expect(newTopic._id).toBe(forum._id);
      expect(newTopic.title).toBe(forum.title);
      expect(newTopic.brandId).toBe(brandB._id);
    });

    test('Remove forum', async () => {
      const brand = await brandFactory({});

      const doc = {
        title: 'Test forum title',
        description: 'Test forum description',
        brandId: brand._id
      };

      const forum = await Forums.createDoc(doc, _user._id);

      expect(await Forums.find().countDocuments()).toBe(1);

      await Forums.removeDoc(forum._id);

      expect(await Forums.find().countDocuments()).toBe(0);

      try {
        await Forums.removeDoc('fakeId');
      } catch (e) {
        expect(e.message).toBe('Forum not found');
      }
    });

    test('Remove forum (Error can`t remove a forum)', async () => {
      const brand = await brandFactory({});

      const doc = {
        title: 'Test forum title',
        description: 'Test forum description',
        brandId: brand._id
      };

      const forum = await Forums.createDoc(doc, _user._id);

      await forumTopicFactory({
        forumId: forum._id
      });

      try {
        await Forums.removeDoc(forum._id);
      } catch (e) {
        expect(e.message).toBe("Can't remove a forum");
      }
    });
  });

  describe('Forum topics', () => {
    afterEach(async () => {
      await ForumTopics.deleteMany({});
      await ForumDiscussions.deleteMany({});
    });

    test('Get forum topic', async () => {
      const topic = await forumTopicFactory();

      try {
        await ForumTopics.getTopic('fakeId');
      } catch (e) {
        expect(e.message).toBe('Topic not found');
      }

      const response = await ForumTopics.getTopic(topic._id);

      expect(response).toBeDefined();
    });

    test(`check if Error('userId must be supplied')
     is being called as intended on create method`, async () => {
      expect.assertions(1);

      try {
        await ForumTopics.createDoc({});
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('Create topic', async () => {
      const forum = await forumFactory();

      const doc = {
        title: 'Test topic title',
        description: 'Test topic description',
        forumId: forum._id
      };

      const topic = await ForumTopics.createDoc(doc, _user._id);

      expect(topic.title).toBe(doc.title);
      expect(topic.description).toBe(doc.description);

      // Values related to modification ======
      expect(topic.createdBy).toBe(_user._id);
      expect(topic.createdDate).toBeDefined();
    });

    test(`check if Error('userId must be supplied)
     is being called as intended on update method`, async () => {
      expect.assertions(1);

      try {
        await ForumTopics.updateDoc('fakeId', {});
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('Update topic', async () => {
      const doc = {
        title: 'Test topic title',
        description: 'Test topic description'
      };

      const topic = await ForumTopics.createDoc(doc, _user._id);

      topic.title = 'Test topic title 2';
      topic.description = 'Test topic description 2';

      const updatedTopic = await ForumTopics.updateDoc(
        topic._id,
        {
          ...topic.toObject()
        },
        _user._id
      );

      expect(updatedTopic._id).toBe(topic._id);
      expect(updatedTopic.title).toBe(topic.title);
      expect(updatedTopic.description).toBe(topic.description);

      // Values related to modification ======
      expect(updatedTopic.modifiedBy).toBe(_user._id);
      expect(updatedTopic.modifiedDate).toBeDefined();
    });

    test('Remove topic', async () => {
      const doc = {
        title: 'Test topic title',
        description: 'Test topic description'
      };

      const topic = await ForumTopics.createDoc(doc, _user._id);

      expect(await ForumTopics.find().countDocuments()).toBe(1);

      await ForumTopics.removeDoc(topic._id);

      expect(await ForumTopics.find().countDocuments()).toBe(0);

      try {
        await ForumTopics.removeDoc('fakeId');
      } catch (e) {
        expect(e.message).toBe('Topic not found');
      }
    });

    test('Remove topic (Error can`t remove a topic)', async () => {
      const doc = {
        title: 'Test topic title',
        description: 'Test topic description'
      };

      const topic = await ForumTopics.createDoc(doc, _user._id);

      await forumDiscussionFactory({ topicId: topic._id });

      expect(await ForumTopics.find().countDocuments()).toBe(1);

      try {
        await ForumTopics.removeDoc(topic._id);
      } catch (e) {
        expect(e.message).toBe("Can't remove a topic");
      }
    });
  });

  describe('Forum discussions', () => {
    afterEach(async () => {
      await ForumDiscussions.deleteMany({});
    });

    test('Get forum discussion', async () => {
      const discussion = await forumDiscussionFactory();

      try {
        await ForumDiscussions.getDiscussion('fakeId');
      } catch (e) {
        expect(e.message).toBe('Discussion not found');
      }

      const response = await ForumDiscussions.getDiscussion(discussion._id);

      expect(response).toBeDefined();
    });

    test(`check if Error('userId must be supplied') when creating`, async () => {
      expect.assertions(1);

      try {
        await ForumDiscussions.createDoc({});
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('Create Discussion', async () => {
      const doc = {
        title: 'Test discussion title',
        description: 'Test discussion description',
        content: 'Test discussion content',
        status: FORUM_DISCUSSION_STATUSES.CLOSED
      };

      const discussion = await ForumDiscussions.createDoc(doc, _user._id);

      expect(discussion.title).toBe(doc.title);
      expect(discussion.description).toBe(doc.description);
      expect(discussion.content).toBe(doc.content);
      expect(discussion.status).toBe(doc.status);
    });

    test(`check if Error('userId must be supplied') when updating`, async () => {
      expect.assertions(1);

      try {
        await ForumDiscussions.updateDoc('fakeId', {});
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('Update discussion', async () => {
      const doc = {
        title: 'Test discussion title',
        description: 'Test discussion description',
        content: 'Test discussion content',
        status: FORUM_DISCUSSION_STATUSES.CLOSED
      };

      const discussion = await ForumDiscussions.createDoc(doc, _user._id);

      discussion.title = 'Test discussion title 2';
      discussion.description = 'Test discussion description 2';
      discussion.content = 'Test discussion content 2';
      discussion.status = FORUM_DISCUSSION_STATUSES.PUBLISH;

      const updatedDiscussion = await ForumDiscussions.updateDoc(
        discussion._id,
        {
          ...discussion.toObject()
        },
        _user._id
      );

      expect(discussion.title).toBe(updatedDiscussion.title);
      expect(discussion.description).toBe(updatedDiscussion.description);
      expect(discussion.content).toBe(updatedDiscussion.content);
      expect(discussion.status).toBe(updatedDiscussion.status);
    });

    test('Remove dicsussion', async () => {
      const doc = {
        title: 'Test discussion title',
        description: 'Test discussion description',
        content: 'Test discussion content',
        status: FORUM_DISCUSSION_STATUSES.PUBLISH
      };

      const discussion = await ForumDiscussions.createDoc(doc, _user._id);

      expect(await ForumDiscussions.find().countDocuments()).toBe(1);

      await ForumDiscussions.removeDoc(discussion._id);

      expect(await ForumDiscussions.find().countDocuments()).toBe(0);

      try {
        await ForumDiscussions.removeDoc('fakeId');
      } catch (e) {
        expect(e.message).toBe('Discussion not found');
      }
    });
  });

  describe('Discussion comments', () => {
    afterEach(async () => {
      await DiscussionComments.deleteMany({});
    });

    test('Get discussion comment', async () => {
      const comment = await discussionCommentFactory();

      try {
        await DiscussionComments.getComment('fakeId');
      } catch (e) {
        expect(e.message).toBe('Comment not found');
      }

      const response = await DiscussionComments.getComment(comment._id);

      expect(response).toBeDefined();
    });

    test(`check if Error('userId must be supplied') when creating`, async () => {
      expect.assertions(1);

      try {
        await DiscussionComments.createDoc({});
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('Create discussion', async () => {
      const discussion = await forumDiscussionFactory();

      const doc = {
        title: 'Test comment title',
        content: 'Test comment content',
        discussionId: discussion._id
      };

      const comment = await DiscussionComments.createDoc(doc, _user._id);

      expect(comment.title).toBe(doc.title);
      expect(comment.content).toBe(doc.content);
      expect(comment.discussionId).toBe(doc.discussionId);
    });

    test(`check if Error('userId must be supplied) when updating`, async () => {
      expect.assertions(1);

      try {
        await DiscussionComments.updateDoc('fakerId', {});
      } catch (e) {
        expect(e.message).toBe('userId must be supplied');
      }
    });

    test('Update comment', async () => {
      const doc = {
        title: 'Test comment title',
        content: 'Test comment content'
      };

      const comment = await DiscussionComments.createDoc(doc, _user._id);

      comment.title = 'Test comment title 2';
      comment.content = 'Test comment content 2';

      const updatedComment = await DiscussionComments.updateDoc(
        comment._id,
        {
          ...comment.toObject()
        },
        _user._id
      );

      expect(comment.title).toBe(updatedComment.title);
      expect(comment.content).toBe(updatedComment.content);
    });

    test('Remove comment', async () => {
      const doc = {
        title: 'Test comment title',
        content: 'Test comment content'
      };

      const comment = await DiscussionComments.createDoc(doc, _user._id);

      expect(await DiscussionComments.find().countDocuments()).toBe(1);

      await DiscussionComments.removeDoc(comment._id);

      expect(await DiscussionComments.find().countDocuments()).toBe(0);

      try {
        await DiscussionComments.removeDoc('fakeId');
      } catch (e) {
        expect(e.message).toBe('Comment not found');
      }
    });
  });

  describe('Forum discussion reaction', () => {
    afterEach(async () => {
      await ForumReactions.deleteMany({});
    });

    test('Create Discussion Reaction', async () => {
      const comment = await discussionCommentFactory();

      const doc = {
        type: 'like',
        contentType: 'comment',
        contentTypeId: comment._id
      };

      const reaction = await ForumReactions.createDoc(doc, _user._id);

      expect(reaction.type).toBe(doc.type);
      expect(reaction.contentType).toBe(doc.contentType);
      expect(reaction.contentTypeId).toBe(doc.contentTypeId);
    });
  });
});
