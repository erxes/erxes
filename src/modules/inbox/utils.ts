import gql from 'graphql-tag';
import queryString from 'query-string';
import { queries } from './graphql';

export const generateParams = queryParams => ({
  limit: queryParams.limit ? parseInt(queryParams.limit, 10) : 10,
  channelId: queryParams.channelId,
  status: queryParams.status,
  unassigned: queryParams.unassigned,
  brandId: queryParams.brandId,
  tag: queryParams.tag,
  integrationType: queryParams.integrationType,
  participating: queryParams.participating,
  starred: queryParams.starred,
  startDate: queryParams.startDate,
  endDate: queryParams.endDate
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

export const getConfig = (key: string) => {
  const sidebarConfig = localStorage.getItem(key);

  if (sidebarConfig) {
    return JSON.parse(sidebarConfig);
  }
};

export const setConfig = (key, params) => {
  localStorage.setItem(key, JSON.stringify(params));
};
