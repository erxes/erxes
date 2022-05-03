export default {
  actions: [
    {
      label: 'Knowledge Base created',
      action: 'create',
      type: 'knowledgeBaseArticle'
    },
    {
      label: 'Knowledge Base updated',
      action: 'update',
      type: 'knowledgeBaseArticle'
    },
    {
      label: 'Knowledge Base deleted',
      action: 'delete',
      type: 'knowledgeBaseArticle'
    },
  ],
  getInfo: ({ data: { data, actionText }}) => {
    return {
      url: `/knowledgeBase?id=${data.newData.categoryIds[0]}`,
      content: `Knowledge base article ${actionText}`
    }
  }
}