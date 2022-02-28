import { fetchElk } from '../../elasticsearch';

export const findElkFields = async query => {
  const response = await fetchElk({
    action: 'search',
    index: 'fields',
    body: {
      query
    },
    defaultValue: { hits: { hits: [] } }
  });

  return response.hits.hits.map(hit => {
    return {
      _id: hit._id,
      ...hit._source
    };
  });
};
