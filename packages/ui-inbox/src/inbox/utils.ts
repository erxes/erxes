import * as activityLogsUtils from '@erxes/ui-log/src/activityLogs/utils';

import { getConfig, setConfig } from '@erxes/ui/src/utils/core';

import { IConversation } from './types';
import { gql } from '@apollo/client';
import { queries } from './graphql';
import queryString from 'query-string';

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
  awaitingResponse: queryParams.awaitingResponse,
  segment: queryParams.segment
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
  const integration = conversation.integration;
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

export const hasAnyActivity = activityLogsUtils.hasAnyActivity;
