import * as React from 'react';
import { iconPlus, iconSearch } from "../../icons/Icons";
import { __ } from "../../utils";
import { ConversationItem } from "../containers";
import { IConversation } from "../types";
import { TopBar } from '../containers';

type Props = {
  conversations: IConversation[];
  goToConversation: (conversationId: string) => void;
  createConversation: (e: React.FormEvent<HTMLLIElement>) => void;
  goToHome: () => void;
  loading: boolean;
};

function ConversationList(props: Props) {
  const {
    conversations,
    goToConversation,
    loading,
    createConversation,
    goToHome
  } = props;
  const [searchValue, setSearchValue] = React.useState<string>('');
  const [ conversationList, setConversationList] = React.useState<IConversation[]>([]);

  React.useEffect(() => {
    
    if(!loading) {
      setConversationList(conversations);
    }

    if(searchValue) {
      setConversationList(result => result.filter(conv => conv.content.toString().toLowerCase().indexOf(searchValue.toLowerCase()) > -1));
    }
  }, [searchValue, loading]);

  if (loading) {
    return <div className="loader" />;
  }  

  const createButton = () => {
    return (
      <ul className="erxes-last-section">
        <li onClick={createConversation} className="erxes-create-btn">
          <span>{iconPlus}</span>
          <span className="erxes-start-text">{__("Start new conversation")}</span>
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
            <input type="text" onChange={(e) => setSearchValue(e.target.value)} placeholder="Search for a conversation..." value={searchValue} />
          </div>
        </div>
      </li>
    );
  }

  return (
    <>
    <TopBar
          middle={
          `Previous Conversations`
          }
          onLeftButtonClick={goToHome}
        />
        <div className="erxes-content">
        <ul className="erxes-conversation-list">
          {searchButton()}
          {conversationList.map(conversation => (
            <ConversationItem
              key={conversation._id}
              conversation={conversation}
              goToConversation={goToConversation}
            />
          ))}
        </ul>
        {createButton()}
      </div>
    </>
  );
}

export default ConversationList;
