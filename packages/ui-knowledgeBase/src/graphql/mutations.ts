const topicCommonParamsDef = `$doc: KnowledgeBaseTopicDoc!`;
const categoryCommonParamsDef = `$doc: KnowledgeBaseCategoryDoc!`;
const articleCommonParamsDef = `$doc: KnowledgeBaseArticleDoc!`;

const commonParams = `doc: $doc`;

const knowledgeBaseTopicsAdd = `
  mutation knowledgeBaseTopicsAdd(${topicCommonParamsDef}) {
    knowledgeBaseTopicsAdd(${commonParams}) {
      _id
    }
  }
`;

const knowledgeBaseTopicsEdit = `
  mutation knowledgeBaseTopicsEdit($_id: String!, ${topicCommonParamsDef}) {
    knowledgeBaseTopicsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const knowledgeBaseTopicsRemove = `
  mutation knowledgeBaseTopicsRemove($_id: String!) {
    knowledgeBaseTopicsRemove(_id: $_id)
  }
`;

const knowledgeBaseCategoriesAdd = `
  mutation knowledgeBaseCategoriesAdd(${categoryCommonParamsDef}) {
    knowledgeBaseCategoriesAdd(${commonParams}) {
      _id
    }
  }
`;

const knowledgeBaseCategoriesEdit = `
  mutation knowledgeBaseCategoriesEdit($_id: String!, ${categoryCommonParamsDef}) {
    knowledgeBaseCategoriesEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const knowledgeBaseCategoriesRemove = `
  mutation knowledgeBaseCategoriesRemove($_id: String!) {
    knowledgeBaseCategoriesRemove(_id: $_id)
  }
`;

const knowledgeBaseArticlesAdd = `
  mutation knowledgeBaseArticlesAdd(${articleCommonParamsDef}) {
    knowledgeBaseArticlesAdd(${commonParams}) {
      _id
    }
  }
`;

const knowledgeBaseArticlesEdit = `
  mutation knowledgeBaseArticlesEdit($_id: String!, ${articleCommonParamsDef}) {
    knowledgeBaseArticlesEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const knowledgeBaseArticlesRemove = `
  mutation knowledgeBaseArticlesRemove($_id: String!) {
    knowledgeBaseArticlesRemove(_id: $_id)
  }
`;

export default {
  knowledgeBaseTopicsAdd,
  knowledgeBaseTopicsEdit,
  knowledgeBaseTopicsRemove,
  knowledgeBaseCategoriesAdd,
  knowledgeBaseCategoriesEdit,
  knowledgeBaseCategoriesRemove,
  knowledgeBaseArticlesAdd,
  knowledgeBaseArticlesEdit,
  knowledgeBaseArticlesRemove
};
