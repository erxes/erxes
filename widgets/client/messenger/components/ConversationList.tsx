import * as React from 'react';
import { __ } from '../../utils';
import ConversationItem from '../containers/ConversationItem';
import { IConversation } from '../types';
import Button from './common/Button';
import Container from './common/Container';

const IconMessage = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="33"
    height="32"
    fill="none"
    viewBox="0 0 33 32"
  >
    <path
      fill="#000"
      fillRule="evenodd"
      d="M27.333 2.667a2.5 2.5 0 0 1 2.5 2.5v23.778c0 1.335-1.613 2.005-2.558 1.063L21.245 24H5.667a2.5 2.5 0 0 1-2.5-2.5V5.167a2.5 2.5 0 0 1 2.5-2.5z"
      clipRule="evenodd"
    ></path>
    <path
      fill="#fff"
      fillRule="evenodd"
      d="M23 9.667a1 1 0 0 1 0 2H9.667a1 1 0 1 1 0-2zm-6 6.666a1 1 0 1 1 0 2h-6.667a1 1 0 0 1 0-2z"
      clipRule="evenodd"
    ></path>
  </svg>
);

const IconChevronRight = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.20999 14.7699C7.07216 14.6266 6.99685 14.4345 7.0006 14.2357C7.00435 14.037 7.08686 13.8478 7.22999 13.7099L11.168 9.99989L7.22999 6.28989C7.15565 6.22245 7.0956 6.14077 7.0534 6.0497C7.01119 5.95863 6.9877 5.86002 6.98431 5.7597C6.98093 5.65939 6.99771 5.55941 7.03366 5.4657C7.06962 5.37199 7.12402 5.28644 7.19365 5.21414C7.26327 5.14184 7.3467 5.08425 7.43899 5.04479C7.53127 5.00532 7.63055 4.98478 7.73092 4.98438C7.83129 4.98398 7.93072 5.00374 8.02332 5.04247C8.11592 5.08121 8.1998 5.13814 8.26999 5.20989L12.77 9.45989C12.8426 9.52985 12.9003 9.61373 12.9398 9.70651C12.9792 9.79929 12.9995 9.89907 12.9995 9.99989C12.9995 10.1007 12.9792 10.2005 12.9398 10.2933C12.9003 10.386 12.8426 10.4699 12.77 10.5399L8.26999 14.7899C8.12674 14.9277 7.93462 15.003 7.73585 14.9993C7.53709 14.9955 7.34795 14.913 7.20999 14.7699Z"
      fill="white"
    />
  </svg>
);

type Props = {
  conversations: IConversation[];
  goToConversation: (conversationId: string) => void;
  createConversation: () => void;
  goToHome: () => void;
  loading: boolean;
};

function ConversationList(props: Props) {
  const {
    conversations: conversationList,
    goToConversation,
    loading,
    createConversation,
  } = props;

  const renderList = () => {
    if (conversationList.length === 0) {
      return (
        <div className="conversation-list-empty-container">
          <IconMessage />
          <h2>{__('No messages')}</h2>
          <span>{__('Messages from the team will be shown here')}</span>
        </div>
      );
    }
    return (
      <ul className="conversation-list-wrapper">
        {conversationList.map((conversation) => (
          <ConversationItem
            key={conversation._id}
            conversation={conversation}
            goToConversation={goToConversation}
          />
        ))}
      </ul>
    );
  };

  return (
    <Container
      withBottomNavBar={false}
      title={__('Messages')}
      persistentFooter={
        <Button icon={<IconChevronRight />} full onClick={createConversation}>
          <span className="font-semibold">{__('Send us a message')}</span>
        </Button>
      }
    >
      <div className="conversation-list-container">
        {loading ? <div className="loader" /> : renderList()}
      </div>
    </Container>
  );
}

export default ConversationList;
