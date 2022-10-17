import { queries } from '../graphql';

export const getRefetchQueries = () => {
  return [
    {
      query: queries.payments,
      variables: {
        paymentIds: []
      }
    },
    {
      query: queries.paymentsTotalCountQuery
    }
  ];
};

export const getGqlString = doc => {
  return doc.loc && doc.loc.source.body;
};
