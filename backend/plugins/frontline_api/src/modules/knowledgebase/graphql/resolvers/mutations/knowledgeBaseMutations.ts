
import { ITopic } from '@/knowledgebase/@types/topic';
import { IArticleCreate } from '@/knowledgebase/db/models/Article';
import { ICategoryCreate } from '@/knowledgebase/db/models/Category';
import { IContext } from '~/connectionResolvers';
import { markResolvers } from 'erxes-api-shared/utils';

export const knowledgeBaseMutations = {

  async knowledgeBaseTopicsAdd(
    _root,
    { doc }: { doc: ITopic },
    { user, models, subdomain }: IContext
  ) {
    const topic = await models.Topic.createDoc(
      doc,
      user._id    
    );

    return topic;
  },

  async knowledgeBaseTopicsEdit(
    _root,
    { _id, doc }: { _id: string; doc: ITopic },
    { user, models, subdomain }: IContext
  ) {
    const topic = await models.Topic.getTopic(_id);
    const updated = await models.Topic.updateDoc(
      _id,
      doc,
      user._id
    );

;

    return updated;
  },

  async knowledgeBaseTopicsRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const topic = await models.Topic.getTopic(_id);
    const removed = await models.Topic.removeDoc(_id);


    return removed;
  },

  async knowledgeBaseCategoriesAdd(
    _root,
    { doc }: { doc: ICategoryCreate },
    { user, models, subdomain }: IContext
  ) {
    const kbCategory = await models.Category.createDoc(
      doc,
      user._id
    );


    return kbCategory;
  },

  async knowledgeBaseCategoriesEdit(
    _root,
    { _id, doc }: { _id: string; doc: ICategoryCreate },
    { user, models, subdomain }: IContext
  ) {
    const kbCategory = await models.Category.getCategory(_id);
    const updated = await models.Category.updateDoc(
      _id,
      doc,
      user._id
    );

    return updated;
  },

  async knowledgeBaseCategoriesRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const kbCategory = await models.Category.getCategory(_id);

    await models.Category.updateMany(
      { parentCategoryId: { $in: [kbCategory._id] } },
      { $unset: { parentCategoryId: 1 } }
    );

    const removed = await models.Category.removeDoc(_id);

    return removed;
  },

  async knowledgeBaseArticlesAdd(
    _root,
    { doc }: { doc: IArticleCreate },
    { user, models, subdomain }: IContext
  ) {
    if (doc.status === 'scheduled' && !doc.scheduledDate) {
      throw new Error('Scheduled Date must be supplied');
    }
  
    if(doc.status === 'scheduled' && doc.scheduledDate && doc.scheduledDate < new Date()){
      throw new Error('Scheduled Date can not be in the past !');
    }
  
    const kbArticle = await models.Article.createDoc(
      doc,
      user._id
    );

    return kbArticle;
  },

  async knowledgeBaseArticlesEdit(
    _root,
    { _id, doc }: { _id: string; doc: IArticleCreate },
    { user, models, subdomain }: IContext
  ) {
    const kbArticle = await models.Article.getArticle(_id);

    if (doc.status === 'scheduled' && !doc.scheduledDate) {
      throw new Error('Scheduled Date must be supplied');
    }

    if(doc.status === 'scheduled' && doc.scheduledDate && doc.scheduledDate < new Date()){
      throw new Error('Scheduled Date can not be in the past !');
    }

    const updated = await models.Article.updateDoc(
      _id,
      doc,
      user._id
    );

    return updated;
  },


  async knowledgeBaseArticlesRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const kbArticle = await models.Article.getArticle(_id);
    const removed = await models.Article.removeDoc(_id);


    return removed;
  },

  async knowledgeBaseArticlesIncrementViewCount(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return await models.Article.incrementViewCount(_id);
  }
};

markResolvers(knowledgeBaseMutations, {
  wrapperConfig: {
    skipPermission: true,
  },
});

export default knowledgeBaseMutations;
