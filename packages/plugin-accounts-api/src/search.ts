import { doSearch } from '@erxes/api-utils/src/elasticsearch';

const search = async ({ subdomain, data: { value } }) => {
  return [
    {
      module: 'accounts',
      items: await doSearch({
        subdomain,
        index: 'account',
        value,
        fields: [
          'code',
          'name',
          'accountCount',
          'status',
          'categoryId',
          'accountCount'
        ]
      })
    }
  ];
};

export default search;
