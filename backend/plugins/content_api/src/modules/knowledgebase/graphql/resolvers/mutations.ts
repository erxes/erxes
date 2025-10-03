import { checkPermission } from 'erxes-api-shared/core-modules';
import { ITopic } from '@/knowledgebase/@types/knowledgebase';
import { IContext } from '~/connectionResolvers';
import {
  IArticleCreate,
  ICategoryCreate,
} from '~/modules/knowledgebase/db/models/Knowledgebase';

const knowledgeBaseMutations = {
  /**
   * Creates a topic document
   */
  async knowledgeBaseTopicsAdd(
    _root,
    { input }: { input: ITopic },
    { user, models }: IContext,
  ) {
    return models.KnowledgeBaseTopics.createDoc(input, user._id);

    // TODO: implement logs
    // await putCreateLog(
    //   models,
    //
    //   {
    //     type: MODULE_NAMES.KB_TOPIC,
    //     newData: {
    //       ...doc,
    //       createdBy: user._id,
    //       createdDate: topic.createdDate
    //     },
    //     object: topic
    //   },
    //   user
    // );
  },

  /**
   * Updates a topic document
   */
  async knowledgeBaseTopicsEdit(
    _root,
    { _id, input }: { _id: string; input: ITopic },
    { user, models }: IContext,
  ) {
    // const topic = await models.KnowledgeBaseTopics.getTopic(_id);
    return models.KnowledgeBaseTopics.updateDoc(_id, input, user._id);

    // TODO: implement logs
    // await putUpdateLog(
    //   models,
    //
    //   {
    //     type: MODULE_NAMES.KB_TOPIC,
    //     object: topic,
    //     newData: {
    //       ...doc,
    //       modifiedBy: user._id,
    //       modifiedDate: updated.modifiedDate,
    //     },
    //     updatedDocument: updated,
    //   },
    //   user,
    // );

    // return updated;
  },

  /**
   * Remove topic document
   */
  async knowledgeBaseTopicsRemove(
    _root,
    { _id }: { _id: string },
    { user, models }: IContext,
  ) {
    // const topic = await models.KnowledgeBaseTopics.getTopic(_id);
    const removed = await models.KnowledgeBaseTopics.removeDoc(_id);
    const categories = await models.KnowledgeBaseCategories.find({
      topicId: _id,
    });

    for (const category of categories) {
      await models.KnowledgeBaseArticles.deleteMany({
        categoryId: category._id,
      });

      await models.KnowledgeBaseCategories.removeDoc(category._id);
    }

    // TODO: implement logs
    // await putDeleteLog(
    //   models,
    //
    //   { type: MODULE_NAMES.KB_TOPIC, object: topic },
    //   user,
    // );

    return removed;
  },

  /**
   * Create category document
   */
  async knowledgeBaseCategoriesAdd(
    _root,
    { input }: { input: ICategoryCreate },
    { user, models }: IContext,
  ) {
    return models.KnowledgeBaseCategories.createDoc(input, user._id);

    // await putCreateLog(
    //   models,
    //
    //   {
    //     type: MODULE_NAMES.KB_CATEGORY,
    //     newData: {
    //       ...doc,
    //       createdBy: user._id,
    //       createdDate: kbCategory.createdDate,
    //     },
    //     object: kbCategory,
    //   },
    //   user,
    // );

    // return kbCategory;
  },

  /**
   * Update category document
   */
  async knowledgeBaseCategoriesEdit(
    _root,
    { _id, input }: { _id: string; input: ICategoryCreate },
    { user, models }: IContext,
  ) {
    // const kbCategory = await models.KnowledgeBaseCategories.getCategory(_id);
    return models.KnowledgeBaseCategories.updateDoc(_id, input, user._id);

    // TODO: implement logs
    // await putUpdateLog(
    //   models,

    //   {
    //     type: MODULE_NAMES.KB_CATEGORY,
    //     object: kbCategory,
    //     newData: {
    //       ...doc,
    //       modifiedBy: user._id,
    //       modifiedDate: updated.modifiedDate,
    //     },
    //     updatedDocument: updated,
    //   },
    //   user,
    // );

    // return updated;
  },

  /**
   * Remove category document
   */
  async knowledgeBaseCategoriesRemove(
    _root,
    { _id }: { _id: string },
    { user, models }: IContext,
  ) {
    const kbCategory = await models.KnowledgeBaseCategories.getCategory(_id);

    await models.KnowledgeBaseCategories.updateMany(
      { parentCategoryId: { $in: [kbCategory._id] } },
      { $unset: { parentCategoryId: 1 } },
    );

    return models.KnowledgeBaseCategories.removeDoc(_id);

    // TODO: implement logs
    // await putDeleteLog(
    //   models,

    //   { type: MODULE_NAMES.KB_CATEGORY, object: kbCategory },
    //   user,
    // );

    // return removed;
  },

  /**
   * Create article document
   */
  async knowledgeBaseArticlesAdd(
    _root,
    { input }: { input: IArticleCreate },
    { user, models }: IContext,
  ) {
    if (input.status === 'scheduled' && !input.scheduledDate) {
      throw new Error('Scheduled Date must be supplied');
    }

    if (
      input.status === 'scheduled' &&
      input.scheduledDate &&
      input.scheduledDate < new Date()
    ) {
      throw new Error('Scheduled Date cannot be in the past!');
    }

    return models.KnowledgeBaseArticles.createDoc(input, user._id);

    // TODO: implement logs
    // await putCreateLog(
    //   models,

    //   {
    //     type: MODULE_NAMES.KB_ARTICLE,
    //     newData: {
    //       ...doc,
    //       createdBy: user._id,
    //       createdDate: kbArticle.createdDate,
    //     },
    //     object: kbArticle,
    //   },
    //   user,
    // );

    // TODO: implement history
    // await sendCoreMessage({
    //   action: 'registerOnboardHistory',
    //   data: {
    //     type: 'knowledgeBaseArticleCreate',
    //     user,
    //   },
    // });

    // const topic = await models.KnowledgeBaseTopics.findOne({
    //   _id: kbArticle.topicId,
    // });

    // TODO: implement notifications
    // if (topic && topic.notificationSegmentId) {
    //   const userIds = await sendCoreMessage({
    //     action: 'fetchSegment',
    //     data: {
    //       segmentId: topic.notificationSegmentId,
    //     },
    //     isRPC: true,
    //   });

    //   sendCoreMessage({
    //     action: 'sendMobileNotification',
    //     data: {
    //       title: doc.title,
    //       body: stripHtml(doc.content),
    //       receivers: userIds.filter((userId) => userId !== user._id),
    //       data: {
    //         type: 'knowledge',
    //         id: kbArticle._id,
    //       },
    //     },
    //   });
    // }

    // return kbArticle;
  },

  /**
   * Update article document
   */
  async knowledgeBaseArticlesEdit(
    _root,
    { _id, input }: { _id: string; input: IArticleCreate },
    { user, models }: IContext,
  ) {
    const kbArticle = await models.KnowledgeBaseArticles.getArticle(_id);

    if (input.status === 'scheduled' && !input.scheduledDate) {
      throw new Error('Scheduled Date must be supplied');
    }

    if (
      input.status === 'scheduled' &&
      input.scheduledDate &&
      input.scheduledDate < new Date()
    ) {
      throw new Error('Scheduled Date cannot be in the past !');
    }

    return models.KnowledgeBaseArticles.updateDoc(_id, input, user._id);

    // TODO: implement logs
    // await putUpdateLog(
    //   models,

    //   {
    //     type: MODULE_NAMES.KB_ARTICLE,
    //     object: kbArticle,
    //     newData: {
    //       ...doc,
    //       modifiedBy: user._id,
    //       modifiedDate: updated.modifiedDate,
    //     },
    //     updatedDocument: updated,
    //   },
    //   user,
    // );

    // return updated;
  },

  /**
   * Remove article document
   */
  async knowledgeBaseArticlesRemove(
    _root,
    { _id }: { _id: string },
    { user, models }: IContext,
  ) {
    // const kbArticle = await models.KnowledgeBaseArticles.getArticle(_id);
    return models.KnowledgeBaseArticles.removeDoc(_id);

    // TODO: implement logs
    // await putDeleteLog(
    //   models,

    //   { type: MODULE_NAMES.KB_ARTICLE, object: kbArticle },
    //   user,
    // );

    // return removed;
  },

  async knowledgeBaseArticlesIncrementViewCount(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.KnowledgeBaseArticles.incrementViewCount(_id);
  },
};

checkPermission(
  knowledgeBaseMutations,
  'knowledgeBaseTopicsAdd',
  'manageKnowledgeBase',
);
checkPermission(
  knowledgeBaseMutations,
  'knowledgeBaseTopicsEdit',
  'manageKnowledgeBase',
);
checkPermission(
  knowledgeBaseMutations,
  'knowledgeBaseTopicsRemove',
  'manageKnowledgeBase',
);

checkPermission(
  knowledgeBaseMutations,
  'knowledgeBaseCategoriesAdd',
  'manageKnowledgeBase',
);
checkPermission(
  knowledgeBaseMutations,
  'knowledgeBaseCategoriesEdit',
  'manageKnowledgeBase',
);
checkPermission(
  knowledgeBaseMutations,
  'knowledgeBaseCategoriesRemove',
  'manageKnowledgeBase',
);

checkPermission(
  knowledgeBaseMutations,
  'knowledgeBaseArticlesAdd',
  'manageKnowledgeBase',
);
checkPermission(
  knowledgeBaseMutations,
  'knowledgeBaseArticlesEdit',
  'manageKnowledgeBase',
);
checkPermission(
  knowledgeBaseMutations,
  'knowledgeBaseArticlesRemove',
  'manageKnowledgeBase',
);

export default knowledgeBaseMutations;
