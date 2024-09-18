export default {
  constants: {
    triggers: [
      {
        type: 'knowledgebase:knowledgeBaseArticle',
        img: 'automation3.svg',
        icon: 'doc-text-inv',
        label: 'When Knowledgebase article published',
        description:
          'Start with a blank workflow that enrolls and is triggered off knowledgebase articles',
        isCustom: true
      }
    ]
  },
  checkCustomTrigger: ({ data }) => {
    const { target, config } = data;

    if (target.topicId !== config?.topicId) {
      return false;
    }

    if (target.categoryId !== config?.categoryId) {
      return false;
    }

    if (target.status === 'published') {
      return true;
    }
  }
};
