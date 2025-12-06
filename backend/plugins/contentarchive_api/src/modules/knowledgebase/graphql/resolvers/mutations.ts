import { IContext } from '~/connectionResolvers';
import { BaseMutationResolver } from '@/portal/utils/base-resolvers';
import { PermissionManager } from '@/portal/utils/permission-utils';
import { ITopic } from '@/knowledgebase/@types/knowledgebase';
import {
  IArticleCreate,
  ICategoryCreate,
} from '~/modules/knowledgebase/db/models/Knowledgebase';

class KnowledgeBaseMutationResolver extends BaseMutationResolver {
  /**
   * Creates a topic document
   */
  async knowledgeBaseTopicsAdd(
    _root: any,
    { input }: { input: ITopic },
    { user, models }: IContext,
  ) {
    return models.KnowledgeBaseTopics.createDoc(input, user._id);
  }

  /**
   * Updates a topic document
   */
  async knowledgeBaseTopicsEdit(
    _root: any,
    { _id, input }: { _id: string; input: ITopic },
    { user, models }: IContext,
  ) {
    return models.KnowledgeBaseTopics.updateDoc(_id, input, user._id);
  }

  /**
   * Remove topic document
   */
  async knowledgeBaseTopicsRemove(
    _root: any,
    { _id }: { _id: string },
    { user, models }: IContext,
  ) {
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

    return removed;
  }

  /**
   * Create category document
   */
  async knowledgeBaseCategoriesAdd(
    _root: any,
    { input }: { input: ICategoryCreate },
    { user, models }: IContext,
  ) {
    return models.KnowledgeBaseCategories.createDoc(input, user._id);
  }

  /**
   * Update category document
   */
  async knowledgeBaseCategoriesEdit(
    _root: any,
    { _id, input }: { _id: string; input: ICategoryCreate },
    { user, models }: IContext,
  ) {
    return models.KnowledgeBaseCategories.updateDoc(_id, input, user._id);
  }

  /**
   * Remove category document
   */
  async knowledgeBaseCategoriesRemove(
    _root: any,
    { _id }: { _id: string },
    { user, models }: IContext,
  ) {
    const kbCategory = await models.KnowledgeBaseCategories.getCategory(_id);

    await models.KnowledgeBaseCategories.updateMany(
      { parentCategoryId: { $in: [kbCategory._id] } },
      { $unset: { parentCategoryId: 1 } },
    );

    return models.KnowledgeBaseCategories.removeDoc(_id);
  }

  /**
   * Create article document
   */
  async knowledgeBaseArticlesAdd(
    _root: any,
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
  }

  /**
   * Update article document
   */
  async knowledgeBaseArticlesEdit(
    _root: any,
    { _id, input }: { _id: string; input: IArticleCreate },
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
      throw new Error('Scheduled Date cannot be in the past !');
    }

    return models.KnowledgeBaseArticles.updateDoc(_id, input, user._id);
  }

  /**
   * Remove article document
   */
  async knowledgeBaseArticlesRemove(
    _root: any,
    { _id }: { _id: string },
    { user, models }: IContext,
  ) {
    return models.KnowledgeBaseArticles.removeDoc(_id);
  }

  async knowledgeBaseArticlesIncrementViewCount(
    _root: any,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.KnowledgeBaseArticles.incrementViewCount(_id);
  }
}

const resolver = new KnowledgeBaseMutationResolver({} as IContext);
const knowledgeBaseMutations = {
  knowledgeBaseTopicsAdd: resolver.knowledgeBaseTopicsAdd.bind(resolver),
  knowledgeBaseTopicsEdit: resolver.knowledgeBaseTopicsEdit.bind(resolver),
  knowledgeBaseTopicsRemove: resolver.knowledgeBaseTopicsRemove.bind(resolver),
  knowledgeBaseCategoriesAdd: resolver.knowledgeBaseCategoriesAdd.bind(resolver),
  knowledgeBaseCategoriesEdit: resolver.knowledgeBaseCategoriesEdit.bind(resolver),
  knowledgeBaseCategoriesRemove: resolver.knowledgeBaseCategoriesRemove.bind(resolver),
  knowledgeBaseArticlesAdd: resolver.knowledgeBaseArticlesAdd.bind(resolver),
  knowledgeBaseArticlesEdit: resolver.knowledgeBaseArticlesEdit.bind(resolver),
  knowledgeBaseArticlesRemove: resolver.knowledgeBaseArticlesRemove.bind(resolver),
  knowledgeBaseArticlesIncrementViewCount: resolver.knowledgeBaseArticlesIncrementViewCount.bind(resolver),
};

PermissionManager.applyKnowledgeBasePermissions(knowledgeBaseMutations);

export default knowledgeBaseMutations;
