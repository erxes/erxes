import { IFetchElkArgs } from './types';

export const doSearch = async ({
  customQuery,
  fetchEs,
  subdomain,
  index,
  value,
  fields
}: {
  fetchEs: (args: IFetchElkArgs) => Promise<any>;
  subdomain: string;
  index: string;
  value: string;
  fields: string[];
  customQuery?: any;
}) => {
  const highlightFields = {};

  fields.forEach(field => {
    highlightFields[field] = {};
  });

  const match = {
    multi_match: {
      query: value,
      fields
    }
  };

  let query: any = match;

  if (customQuery) {
    query = customQuery;
  }

  const fetchResults = await fetchEs({
    subdomain,
    action: 'search',
    index,
    body: {
      query: {
        bool: {
          must: [query]
        }
      },
      size: 10,
      highlight: {
        fields: highlightFields
      }
    },
    defaultValue: { hits: { hits: [] } }
  });

  const results = fetchResults.hits.hits.map(result => {
    return {
      source: {
        _id: result._id,
        ...result._source
      },
      highlight: result.highlight
    };
  });

  return results;
};
