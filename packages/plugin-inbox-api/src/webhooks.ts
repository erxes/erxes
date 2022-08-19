export default {
  actions: [
    { label: 'Admin messages', action: 'create', type: 'inbox:userMessages' },
    {
      label: 'Customer create conversation',
      action: 'create',
      type: 'inbox:conversation'
    },
    {
      label: 'Customer messages',
      action: 'create',
      type: 'inbox:customerMessages'
    },
    {
      label: 'Form submission received',
      action: 'create',
      type: 'inbox:popupSubmitted'
    }
  ],
  getInfo: ({ data: { data, contentType } }) => {
    let url: string;
    let content: string;

    switch (contentType) {
      case 'userMessages':
        url = `/inbox/index?_id=${data.conversationId}`;
        content = 'Admin has replied to a conversation';

        break;
      case 'customerMessages':
        url = `/inbox/index?_id=${data.conversationId}`;
        content = 'Customer has send a conversation message';

        break;
      case 'conversation':
        url = `/inbox/index?_id=${data._id}`;
        content = 'Customer has started new conversation';

        break;
      // if contentType equal to popupSubmitted, default will work
      default:
        url = `/inbox/index?_id=${data.conversationId}`;
        content = 'Customer has submitted a form';
    }

    return {
      url,
      content
    };
  }
};
