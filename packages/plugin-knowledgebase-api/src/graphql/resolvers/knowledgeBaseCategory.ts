import { PUBLISH_STATUSES } from '../../models/definitions/constants';
import { ICategoryDocument } from '../../models/definitions/knowledgebase';
import { IContext } from '../../connectionResolver';

export const KnowledgeBaseCategory = {
  async articles(category: ICategoryDocument, args, { models }: IContext) {
    const { status } = args;
    const query = {
      categoryId: category._id,
      status: {
        $in: [PUBLISH_STATUSES.PUBLISH, PUBLISH_STATUSES.DRAFT],
      },
    };
    if (status) {
      query.status = status;
    }

    return models.KnowledgeBaseArticles.find(query).sort({
      createdDate: -1,
    });
  },

  async authors(category: ICategoryDocument, _args, { models }: IContext) {
    const articles = await models.KnowledgeBaseArticles.find(
      {
        categoryId: category._id,
        status: { $in: [PUBLISH_STATUSES.PUBLISH, PUBLISH_STATUSES.DRAFT] },
      },
      { createdBy: 1 }
    );

    const authorIds = articles.map((article) => article.createdBy);

    return (authorIds || []).map((_id) => ({
      __typename: 'User',
      _id,
    }));
  },

  async firstTopic(category: ICategoryDocument, _args, { models }: IContext) {
    return models.KnowledgeBaseTopics.findOne({ _id: category.topicId });
  },

  async numOfArticles(
    category: ICategoryDocument,
    args,
    { models }: IContext
  ) {
    const { status } = args;
    const query = {
      categoryId: category._id,
      status: {
        $in: [PUBLISH_STATUSES.PUBLISH, PUBLISH_STATUSES.DRAFT],
      },
    };

    if (status) {
      query.status = status;
    }

    return models.KnowledgeBaseArticles.find(query).countDocuments();
  },
};

export const KnowledgeBaseParentCategory = {
  ...KnowledgeBaseCategory,

  async childrens(category: ICategoryDocument, _args, { models }: IContext) {
    return models.KnowledgeBaseCategories.find({
      parentCategoryId: category._id,
    }).sort({ title: 1 });
  },
};
