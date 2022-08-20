import { doSearch } from '@erxes/api-utils/src/elasticsearch';

const search = async ({ subdomain, data: { value } }) => {
  return [
    {
      module: 'conversationMessages',
      items: await doSearch({
        subdomain,
        index: 'conversation_messages',
        value,
        fields: ['content']
      })
    }
  ];
};

export default search;
