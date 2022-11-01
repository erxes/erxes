import { doSearch } from '@erxes/api-utils/src/elasticsearch';

const search = async ({ subdomain, data: { value } }) => {
  return [
    {
      module: 'products',
      items: await doSearch({
        subdomain,
        index: 'product',
        value,
        fields: [
          'code',
          'name',
          'unitPrice',
          'productCount',
          'description',
          'supply',
          'status',
          'categoryId'
        ]
      })
    }
  ];
};

export default search;
