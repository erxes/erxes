export default {
  constants: {
    actions: [
      {
        type: 'facebook:message.create',
        icon: 'file-plus',
        label: 'Send Message',
        description: 'Send Facebook Message',
        isAvailable: true
      },
      {
        type: 'facebook:comment.create',
        icon: 'file-plus',
        label: 'Reply Comment',
        description: 'Send Facebook Comment',
        isAvailable: true
      }
    ],
    triggers: [
      {
        type: 'facebook:meesage',
        img: 'automation3.svg',
        icon: 'file-plus-alt',
        label: 'Facebook Message',
        description:
          'Start with a blank workflow that enralls and is triggered off facebook messages'
      },
      {
        type: 'facebook:comment',
        img: 'automation3.svg',
        icon: 'file-plus-alt',
        label: 'Facebook Comment',
        description:
          'Start with a blank workflow that enralls and is triggered off facebook comment'
      }
    ]
  }
};
