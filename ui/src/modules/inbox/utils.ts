import { getConfig, setConfig } from 'erxes-ui/lib/utils/core';
import gql from 'graphql-tag';
import queryString from 'query-string';
import { queries } from './graphql';
import { IConversation } from './types';

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
  endDate: queryParams.endDate,
  awaitingResponse: queryParams.awaitingResponse
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

export { getConfig };
export { setConfig };

export const isConversationMailKind = (conversation: IConversation) => {
  // const integration = conversation.integration ? conversation.integration || {};
  const integration = conversation.integration || {};
  const { kind } = integration;

  if (!kind) {
    return false;
  }

  return kind === 'gmail' || kind.includes('nylas');
};

/**
 * Exctract string from to, cc, bcc
 * ex: Name <user@mail.com>
 */
export const extractEmail = (str?: string) => {
  if (!str || str.length === 0) {
    return '';
  }

  // eslint-disable-next-line
  const emailRegex = /(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/g;
  const emails = str.match(emailRegex);

  if (!emails) {
    return '';
  }

  return emails.join(' ');
};

export const linkify = (url: string) => {
  return url.startsWith('http') ? url : `http://${url}`;
};

export const urlify = (text: string) => {
  // validate url except html a tag
  const urlRegex = /(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w-]+)+[\w\-_~:/?#[\]@!&',;=.]+(?![^<>]*>|[^"]*?<\/a)/g;

  return text.replace(urlRegex, url => {
    if (url.startsWith('http')) {
      return `<a href="${url}" target="_blank">${url}</a>`;
    }

    return `<a href="http://${url}" target="_blank">${url}</a>`;
  });
};
