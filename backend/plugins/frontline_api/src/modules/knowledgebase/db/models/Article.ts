import { IArticle, IArticleDocument } from '../../@types/article';
import { Model } from 'mongoose'
import { IModels } from '~/connectionResolvers';
import { PUBLISH_STATUSES } from '../definitions/constant';
import { articleSchema } from '../definitions/article'



export interface IArticleCreate extends IArticle {
    userId?: string;
    icon?: string;
    modifiedBy?: string;
  }

  export interface IArticleModel extends Model<IArticleDocument> {
    getArticle(_id: string): Promise<IArticleDocument>;
    createDoc(fields: IArticleCreate, userId?: string): Promise<IArticleDocument>;
    updateDoc(
      _id: string,
      fields: IArticleCreate,
      userId?: string
    ): Promise<IArticleDocument>;
    removeDoc(_id: string): Promise<void>;
    modifyReactionCount(
      articleId: string,
      reactionChoice: string,
      modifyType: 'inc' | 'dec'
    ): void;
    incrementViewCount(
      articleId: string,
    ): void;
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
  
        const doc = {
          ...docFields,
          createdDate: new Date(),
          createdBy: userId,
          modifiedDate: new Date()
        };
  
        if (docFields.status === PUBLISH_STATUSES.PUBLISH) {
          doc.publishedUserId = userId;
          doc.publishedAt = new Date();
        }
  
        return  await models.Article.create(doc);
      }

      public static async updateDoc(
        _id: string,
        docFields: IArticleCreate,
        userId?: string
      ) {
        if (!userId) {
          throw new Error('userId must be supplied');
        }
        const article = await models.Article.getArticle(_id);
  
        if(!article){
          throw new Error('Article not found')
        }
  
        const doc = {
          ...docFields,
          modifiedBy: userId,
          modifiedDate: new Date()
        };
  
        if (article.status === PUBLISH_STATUSES.DRAFT && doc.status === PUBLISH_STATUSES.PUBLISH) {
  
          doc.publishedUserId = userId;
          doc.publishedAt = new Date();
        }
  
        return await models.Article.findOneAndUpdate(
          { _id },
          {$set: doc}
        );
  
      }

      public static async removeDoc(_id: string) {
        return models.Article.deleteOne({ _id });
      }

      public static async modifyReactionCount(
        articleId: string,
        reactionChoice: string,
        modifyType: 'inc' | 'dec'
      ) {
        const article = await models.Article.getArticle(articleId);
  
        const reactionCounts = article.reactionCounts || {};
  
        reactionCounts[reactionChoice] =
          (reactionCounts[reactionChoice] || 0) + (modifyType === 'inc' ? 1 : -1);
  
        await models.Article.updateOne(
          { _id: articleId },
          { $set: { reactionCounts } }
        );
      }
  
      public static async incrementViewCount(articleId: string) {
        return await models.Article.updateOne(
          { _id: articleId },
          { $inc: { viewCount: 1 } }
        );
      }
    }
  
    articleSchema.loadClass(Article);
  
    return articleSchema;
  };