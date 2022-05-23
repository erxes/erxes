export default {
  actions: [
    {
      label: 'Knowledge Base created',
      action: 'create',
      type: 'knowledgebase:knowledgeBaseArticle'
    },
    {
      label: 'Knowledge Base updated',
      action: 'update',
      type: 'knowledgebase:knowledgeBaseArticle'
    },
    {
      label: 'Knowledge Base deleted',
      action: 'delete',
      type: 'knowledgebase:knowledgeBaseArticle'
    }
  ],
  getInfo: ({ data: { data, actionText } }) => {
    return {
      url: `/knowledgeBase?id=${data.newData.categoryIds[0]}`,
      content: `Knowledge base article ${actionText}`
    };
  }
};
