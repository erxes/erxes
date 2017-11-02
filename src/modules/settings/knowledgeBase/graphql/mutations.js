const topicCommonParamsDef = `$doc: KnowledgeBaseTopicDoc!`;
const categoryCommonParamsDef = `$doc: KnowledgeBaseCategoryDoc!`;

const commonParams = `doc: $doc`;

export const knowledgeBaseTopicsAdd = `
  mutation knowledgeBaseTopicsAdd(${topicCommonParamsDef}) {
    knowledgeBaseTopicsAdd(${commonParams}) {
      _id
    }
  }
`;

export const knowledgeBaseTopicsEdit = `
  mutation knowledgeBaseTopicsEdit($_id: String!, ${topicCommonParamsDef}) {
    knowledgeBaseTopicsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

export const knowledgeBaseTopicsRemove = `
  mutation knowledgeBaseTopicsRemove($_id: String!) {
    knowledgeBaseTopicsRemove(_id: $_id)
  }
`;

export const knowledgeBaseCategoriesAdd = `
  mutation knowledgeBaseCategoriesAdd(${categoryCommonParamsDef}) {
    knowledgeBaseCategoriesAdd(${commonParams}) {
      _id
    }
  }
`;

export const knowledgeBaseCategoriesEdit = `
  mutation knowledgeBaseCategoriesEdit($_id: String!, ${categoryCommonParamsDef}) {
    knowledgeBaseCategoriesEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

export const knowledgeBaseCategoriesRemove = `
  mutation knowledgeBaseCategoriesRemove($_id: String!) {
    knowledgeBaseCategoriesRemove(_id: $_id)
  }
`;
