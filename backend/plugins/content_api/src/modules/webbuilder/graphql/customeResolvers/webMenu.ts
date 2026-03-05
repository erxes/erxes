const WebMenuItem = {
  async parent(item: any) {
    if (!item.parentId) {
      return null;
    }

    return {
      __typename: 'WebMenuItem',
      _id: item.parentId,
    };
  },

  async web(item: any) {
    if (!item.webId) {
      return null;
    }

    return {
      __typename: 'Web',
      _id: item.webId,
    };
  },
};

export default {
  WebMenuItem,
};
