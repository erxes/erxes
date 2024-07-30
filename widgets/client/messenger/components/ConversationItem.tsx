import * as classNames from 'classnames';
import * as dayjs from 'dayjs';

import * as React from 'react';
import {
  IconActiveCircle,
  IconChevronRight,
  defaultAvatar,
} from '../../icons/Icons';
import { __, readFile, striptags } from '../../utils';
import { IConversation } from '../types';
import * as updateLocale from 'dayjs/plugin/updateLocale';
import * as relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(updateLocale);
dayjs.extend(relativeTime);

dayjs.updateLocale('en', {
  relativeTime: {
    past: (input: string) => {
      // Return "Just now" if the input is 'a few seconds'
      if (input === 'a few seconds') {
        return 'Just now';
      }
      return `${input} ago`;
    },
    s: 'a few seconds',
    m: 'a minute',
    mm: '%dmin',
    h: 'an hour',
    hh: '%dh',
    d: 'a day',
    dd: '%dd',
    M: 'a month',
    MM: '%dmonths',
    y: 'a year',
    yy: '%dyears',
  },
});

type Props = {
  conversation: IConversation;
  unreadCount: number;
  goToConversation: (conversationId: string) => void;
  lastResponse: { content: string; createdAt: Date } | undefined;
};

function ConversationItem({
  conversation,
  unreadCount,
  goToConversation,
  lastResponse,
}: Props) {
  const { _id, content, createdAt } = conversation;
  const participatedUsers = conversation.participatedUsers;
  let participatedUser = null;

  if (participatedUsers && participatedUsers.length > 0) {
    participatedUser = participatedUsers[0];
  }

  let avatar = defaultAvatar;
  let fullName = (__('Support staff') || {}).toString();

  if (participatedUser && participatedUser.details) {
    avatar = participatedUser.details.avatar || defaultAvatar;
    fullName = participatedUser.details.fullName || fullName;
  }

  return (
    <li
      className="single-conversation-wrapper"
      onClick={() => {
        goToConversation(_id);
      }}
    >
      <div className="flex gap-2 flex-1">
        <img src={readFile(avatar)} alt={fullName} />
        <div className="conversation-content-wrapper">
          <div
            className={classNames('conversation-last-message', {
              unread: unreadCount > 0,
            })}
          >
            {striptags(
              lastResponse && lastResponse?.content
                ? lastResponse.content
                : content
            )}
          </div>
          <div className="conversation-info">
            <span>{fullName}</span>
            <span>・</span>
            <div
              className="erxes-date erxes-tooltip"
              // data-tooltip={dayjs(createdAt).format('YYYY-MM-DD, HH:mm:ss')}
            >
              {dayjs(
                lastResponse ? lastResponse.createdAt : createdAt
              ).fromNow()}
            </div>
          </div>
        </div>
      </div>
      {unreadCount === 0 ? <IconChevronRight /> : <IconActiveCircle />}
    </li>
  );
}

export default ConversationItem;
