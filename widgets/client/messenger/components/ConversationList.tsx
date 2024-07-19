import * as React from 'react';
import { iconPlus, iconSearch } from '../../icons/Icons';
import { __ } from '../../utils';
import ConversationItem from '../containers/ConversationItem';
import { IConversation } from '../types';
import Button from './common/Button';
import Container from './common/Container';

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
    conversations,
    goToConversation,
    loading,
    createConversation,
    goToHome,
  } = props;

  const [searchValue, setSearchValue] = React.useState<string>('');
  const [conversationList, setConversationList] = React.useState<
    IConversation[]
  >([]);

  React.useEffect(() => {
    if (!loading) {
      setConversationList(conversations);
    }

    if (searchValue) {
      setConversationList((result) =>
        result.filter(
          (conv) =>
            conv.content
              .toString()
              .toLowerCase()
              .indexOf(searchValue.toLowerCase()) > -1
        )
      );
    }
  }, [searchValue, loading, conversations]);

  const createButton = () => {
    return (
      <ul className="erxes-last-section">
        <li onClick={createConversation} className="erxes-create-btn">
          <span>{iconPlus}</span>
          <span className="erxes-start-text">
            {__('Start new conversation')}
          </span>
        </li>
      </ul>
    );
  };

  const searchButton = () => {
    return (
      <li className="erxes-list-item">
        <div className="erxes-left-side">
          <span>{iconSearch}</span>
        </div>
        <div className="erxes-right-side">
          <div className="erxes-name">
            <input
              type="text"
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search for a conversation..."
              value={searchValue}
            />
          </div>
        </div>
      </li>
    );
  };

  return (
    <Container
      withBottomNavBar={false}
      title="Messages"
      persistentFooter={
        <Button icon={<IconChevronRight />} full onClick={createConversation}>
          <span className="font-semibold">Send us a message</span>
        </Button>
      }
    >
      <div className="conversation-list-container">
        {loading ? (
          <div className="loader" />
        ) : (
          <ul className="conversation-list-wrapper">
            {/* {searchButton()} */}
            {conversationList.map((conversation) => (
              <ConversationItem
                key={conversation._id}
                conversation={conversation}
                goToConversation={goToConversation}
              />
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}

export default ConversationList;
