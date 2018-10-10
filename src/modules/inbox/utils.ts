import gql from 'graphql-tag';
import queryString from 'query-string';
import { queries } from './graphql';

export const generateParams = queryParams => ({
  brandId: queryParams.brandId,
  channelId: queryParams.channelId,
  endDate: queryParams.endDate,
  integrationType: queryParams.integrationType,
  limit: queryParams.limit || 10,
  participating: queryParams.participating,
  starred: queryParams.starred,
  startDate: queryParams.startDate,
  status: queryParams.status,
  tag: queryParams.tag,
  unassigned: queryParams.unassigned
});

export const refetchSidebarConversationsOptions = () => {
  const queryParams = queryString.parse(window.location.search);

  return {
    refetchQueries: [
      {
        query: gql(queries.sidebarConversations),
        variables: generateParams(queryParams)
      }
    ]
  };
};
