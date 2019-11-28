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

export const isConversationMailKind = (conversation: IConversation) => {
  const {
    integration: { kind }
  } = conversation;

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

export const urlify = (text: string) => {
  const rancherRegex = /<a[\s]+([^>]+)>((?:.(?!<\/a\\>))*.)<\/a>/g;

  text = text.replace(rancherRegex, (...args: any[]) => {
    const href = args[1].substring(6, args[1].length - 1);
    const rancherText = args[2];

    if (href === rancherText) {
      return href;
    }

    return `${href}&rancherText=${rancherText}`;
  });

  const urlRegex = /(((https?:\/\/)|(www\.))[-a-zA-Z0-9@:%._~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_.~#?&-a-zA-Z0-9//=]*))/g;

  return text.replace(urlRegex, (url: string) => {
    let rancherText = url;
    let href = url;

    const index = url.indexOf('&rancherText=');

    if (index !== -1) {
      rancherText = url.substring(index + 13);
      href = url.substring(0, index);
    }

    if (!url.includes('http')) {
      href = `http://${url}`;
    }

    return '<a target="_blank" href="' + href + '">' + rancherText + '</a>';
  });
};
