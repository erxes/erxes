import { IArticle, IArticleDocument } from '../../@types/article';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { PUBLISH_STATUSES } from '../definitions/constant';
import { articleSchema } from '../definitions/article';

export interface IArticleCreate extends IArticle {
  userId?: string;
  icon?: string;
  modifiedBy?: string;
  code?: string; // Add code field
}

const FIXED_REACTION_SVGS = [
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-mood-sad"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9.5 15.25a3.5 3.5 0 0 1 5 0" /></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-mood-neutral"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 9l.01 0" /><path d="M15 9l.01 0" /><path d="M8 13a4 4 0 1 0 8 0h-8" /></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-thumb-up"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 11v8a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-7a1 1 0 0 1 1 -1h3a4 4 0 0 0 4 -4v-1a2 2 0 0 1 4 0v5h3a2 2 0 0 1 2 2l-1 5a2 3 0 0 1 -2 2h-7a3 3 0 0 1 -3 -3" /></svg>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-thumb-down"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M7 13v-8a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v7a1 1 0 0 0 1 1h3a4 4 0 0 1 4 4v1a2 2 0 0 0 4 0v-5h3a2 2 0 0 0 2 -2l-1 -5a2 3 0 0 0 -2 -2h-7a3 3 0 0 0 -3 3" /></svg>`,
];
export interface IArticleModel extends Model<IArticleDocument> {
  getArticle(_id: string): Promise<IArticleDocument>;
  createDoc(fields: IArticleCreate, userId?: string): Promise<IArticleDocument>;
  updateDoc(
    _id: string,
    fields: IArticleCreate,
    userId?: string,
  ): Promise<IArticleDocument>;
  removeDoc(_id: string): Promise<void>;
  modifyReactionCount(
    articleId: string,
    reactionChoice: string,
    modifyType: 'inc' | 'dec',
  ): void;
  incrementViewCount(articleId: string): Promise<void>;
}

export const loadArticleClass = (models: IModels) => {
  class Article {
    public static async getArticle(_id: string) {
      const article = await models.Article.findOne({ _id });

      if (!article) {
        throw new Error('Knowledge base article not found');
      }

      return article;
    }

    public static async createDoc(docFields: IArticleCreate, userId?: string) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }

      // Auto-generate code if not provided
      if (!docFields.code) {
        docFields.code = `ART-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`;
      }

      // Ensure content is not empty (only if content is being updated)
      if (
        'content' in docFields &&
        (!docFields.content || docFields.content.trim() === '')
      ) {
        docFields.content = '<p></p>';
      }

      const doc = {
        ...docFields,
        reactionChoices: FIXED_REACTION_SVGS,
        createdDate: new Date(),
        createdBy: userId,
        modifiedDate: new Date(),
      };

      if (docFields.status === PUBLISH_STATUSES.PUBLISH) {
        doc.publishedUserId = userId;
        doc.publishedAt = new Date();
      }

      if (docFields.status === PUBLISH_STATUSES.SCHEDULED) {
        doc.publishedUserId = userId;
        // Keep publishedAt as null until scheduled time
        doc.scheduledDate = docFields.scheduledDate || new Date();
      }

      return await models.Article.create(doc);
    }

    public static async updateDoc(
      _id: string,
      docFields: IArticleCreate,
      userId?: string,
    ) {
      if (!userId) {
        throw new Error('userId must be supplied');
      }
      const article = await models.Article.getArticle(_id);

      if (!article) {
        throw new Error('Article not found');
      }

      // Ensure content is not empty (only if content is being updated)
      if (
        'content' in docFields &&
        (!docFields.content || docFields.content.trim() === '')
      ) {
        docFields.content = '<p></p>';
      }

      const doc = {
        ...docFields,
        reactionChoices: FIXED_REACTION_SVGS,
        modifiedBy: userId,
        modifiedDate: new Date(),
      };

      if (
        article.status === PUBLISH_STATUSES.DRAFT &&
        doc.status === PUBLISH_STATUSES.PUBLISH
      ) {
        doc.publishedUserId = userId;
        doc.publishedAt = new Date();
      }

      if (doc.status === PUBLISH_STATUSES.SCHEDULED) {
        doc.publishedUserId = userId;
        doc.scheduledDate = docFields.scheduledDate || new Date();
        // Clear publishedAt when moving to SCHEDULED
        doc.publishedAt = undefined;
      }

      return await models.Article.findOneAndUpdate({ _id }, { $set: doc });
    }

    public static async removeDoc(_id: string) {
      return models.Article.deleteOne({ _id });
    }

    public static async modifyReactionCount(
      articleId: string,
      reactionChoice: string,
      modifyType: 'inc' | 'dec',
    ) {
      const article = await models.Article.getArticle(articleId);

      const reactionCounts = article.reactionCounts || {};

      reactionCounts[reactionChoice] =
        (reactionCounts[reactionChoice] || 0) + (modifyType === 'inc' ? 1 : -1);

      await models.Article.updateOne(
        { _id: articleId },
        { $set: { reactionCounts } },
      );
    }

    public static async incrementViewCount(articleId: string) {
      return await models.Article.updateOne(
        { _id: articleId },
        { $inc: { viewCount: 1 } },
      );
    }
  }

  articleSchema.loadClass(Article);

  return articleSchema;
};
