import { doSearch } from '@erxes/api-utils/src/elasticsearch';
import { es } from './configs';

const search = async ({ subdomain, data: { value } }) => {
  return [
    {
      module: 'conversationMessages',
      items: await doSearch({
        fetchEs: es.fetchElk,
        subdomain,
        index: 'conversation_messages',
        value,
        fields: ['content']
      })
    }
  ];
};

export default search;
