import { PUBLISH_STATUSES } from '@/knowledgebase/db/definitions/constant';
import { ICategoryDocument } from '@/knowledgebase/@types/category';
import { IContext } from '~/connectionResolvers';

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

    return models.Category.find(query).sort({
      createdDate: -1,
    });
  },

  async authors(category: ICategoryDocument, _args, { models }: IContext) {
    const articles = await models.Category.find(
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
    return models.Category.findOne({ _id: category.topicId });
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

    return models.Category.find(query).countDocuments();
  },
};

export const KnowledgeBaseParentCategory = {
  ...KnowledgeBaseCategory,

  async childrens(category: ICategoryDocument, _args, { models }: IContext) {
    return models.Category.find({
      parentCategoryId: category._id,
    }).sort({ title: 1 });
  },
};
