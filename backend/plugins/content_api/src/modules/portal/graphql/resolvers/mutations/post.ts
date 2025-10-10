import { IContext } from '~/connectionResolvers';
import { BaseMutationResolver } from '@/portal/utils/base-resolvers';
import { PermissionManager } from '@/portal/utils/permission-utils';
import { getTranslationService } from '@/portal/utils/translation-utils';

class PostMutationResolver extends BaseMutationResolver {
  /**
   * Cms post add
   */
  async cmsPostsAdd(_parent: any, args: any, context: IContext): Promise<any> {
    const { user } = context;
    const { input } = args;
    input.authorId = user._id;

    return this.create(this.models.Posts, input, user._id);
  }

  /**
   * Cms post edit
   */
  async cmsPostsEdit(_parent: any, args: any, context: IContext): Promise<any> {
    const { _id, input } = args;
    return this.models.Posts.updatePost(_id, input);
  }

  /**
   * Cms post delete
   */
  async cmsPostsRemove(_parent: any, args: any, context: IContext): Promise<any> {
    const { _id } = args;
    const translationService = getTranslationService(this.models);
    
    await translationService.deleteTranslations(_id);
    return this.models.Posts.deleteOne({ _id });
  }

  /**
   * Cms post change status
   */
  async cmsPostsChangeStatus(_parent: any, args: any, context: IContext): Promise<any> {
    const { _id, status } = args;
    return this.models.Posts.changeStatus(_id, status);
  }

  /**
   * Cms post increment view count
   */
  async cmsPostsIncrementViewCount(_parent: any, args: any, context: IContext): Promise<any> {
    const { session } = context;
    const { _id } = args;

    if (!session.viewedPosts) {
      session.viewedPosts = [];
    }

    if (!session.viewedPosts.includes(_id)) {
      await this.models.Posts.increaseViewCount(_id);
      session.viewedPosts.push(_id);
      await session.save();
    }

    return this.models.Posts.findOne({ _id });
  }

  /**
   * Cms post toggle featured
   */
  async cmsPostsToggleFeatured(_parent: any, args: any, context: IContext): Promise<any> {
    const { _id } = args;
    return this.models.Posts.toggleFeatured(_id);
  }

  /**
   * Add translation
   */
  async cmsAddTranslation(_parent: any, args: any, context: IContext): Promise<any> {
    const { input } = args;
    const translationService = getTranslationService(this.models);
    
    translationService.validateTranslationInput(input);
    
    const model = translationService.getModelByType(input.type);
    const object = await model.findOne({ _id: input.postId });
    
    if (!object) {
      throw new Error('Object not found');
    }

    return translationService.createOrUpdateTranslation(input);
  }

  /**
   * Edit translation
   */
  async cmsEditTranslation(_parent: any, args: any, context: IContext): Promise<any> {
    const { input } = args;
    const translationService = getTranslationService(this.models);
    
    return translationService.createOrUpdateTranslation(input);
  }
}

const resolver = new PostMutationResolver({} as IContext);
const mutations = {
  cmsPostsAdd: resolver.cmsPostsAdd.bind(resolver),
  cmsPostsEdit: resolver.cmsPostsEdit.bind(resolver),
  cmsPostsRemove: resolver.cmsPostsRemove.bind(resolver),
  cmsPostsChangeStatus: resolver.cmsPostsChangeStatus.bind(resolver),
  cmsPostsIncrementViewCount: resolver.cmsPostsIncrementViewCount.bind(resolver),
  cmsPostsToggleFeatured: resolver.cmsPostsToggleFeatured.bind(resolver),
  cmsAddTranslation: resolver.cmsAddTranslation.bind(resolver),
  cmsEditTranslation: resolver.cmsEditTranslation.bind(resolver),
};

PermissionManager.applyCmsPermissions(mutations);

export default mutations;
