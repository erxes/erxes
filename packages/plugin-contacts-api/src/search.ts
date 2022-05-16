import { doSearch } from '@erxes/api-utils/src/elasticsearch';

const search = async ({ subdomain, data: { value } }) => {
  return [
    {
      module: 'contacts',
      items: await doSearch({
        subdomain,
        index: 'customers',
        value,
        fields: [
          'code',
          'firstName',
          'lastName',
          'middleName',
          'primaryPhone',
          'primaryEmail',
          'searchText'
        ]
      })
    },
    {
      module: 'companies',
      items: await doSearch({
        subdomain,
        index: 'companies',
        value,
        fields: [
          'primaryName',
          'industry',
          'plan',
          'primaryEmail',
          'primaryPhone',
          'businessType',
          'description',
          'website',
          'code',
          'searchText'
        ]
      })
    }
  ];
};

export default search;
