import * as React from 'react';
import { IUser } from '../../types';
import asyncComponent from '../../AsyncComponent';
import FaqCategories from './faq/FaqCategories';
import { getMessengerData } from '../utils/util';
import TicketContainer from '../containers/TicketContainer';
import CallContainer from '../containers/CallContainer';
import AccquireInformationContainer from '../containers/AccquireInformation';
import ConversationListContainer from '../containers/ConversationList';
import ConversationDetailContainer from '../containers/ConversationDetail';
import CategoryDetail from '../containers/faq/CategoryDetail';
import ArticleDetailContainer from '../containers/faq/ArticleDetail';
import WebsiteAppDetailContainer from '../containers/websiteApp/WebsiteAppDetail';
import Home from '../containers/Home';

type Props = {
  activeRoute: string | '';
  supporters: IUser[];
  loading: boolean;
  isOnline?: boolean;
};

function Messenger({
  activeRoute,
  isOnline = false,
  supporters,
  loading,
}: Props) {
  const messengerData = getMessengerData();
  const topicId = messengerData.knowledgeBaseTopicId;

  const WithSupporters = (Component: any) => {
    return (
      <Component
        supporters={supporters}
        loading={loading}
        isOnline={isOnline}
      />
    );
  };

  const renderSwitch = () => {
    switch (activeRoute) {
      case 'allConversations':
        return <ConversationListContainer loading={loading} />;
      case 'conversationDetail':
      case 'conversationCreate':
        return WithSupporters(ConversationDetailContainer);

      // get user's contact information
      case 'accquireInformation':
        return <AccquireInformationContainer loading={loading} />;

      case 'faqCategory':
        return <CategoryDetail loading={loading} />;

      case 'faqArticle':
        return <ArticleDetailContainer loading={loading} />;

      case 'websiteApp':
        return <WebsiteAppDetailContainer loading={loading} />;

      case 'faqCategories':
        return <FaqCategories topicId={topicId} loading={loading} />;

      case 'ticket':
        return <TicketContainer />;
      case 'call':
        return <CallContainer />;
      // case 'faqCategories':
      //   return (
      //     <Home
      //       supporters={supporters}
      //       isOnline={isOnline}
      //       activeSupport={true}
      //     />
      //   );

      default:
        return WithSupporters(Home);
    }
  };
  return renderSwitch();
}

export default Messenger;
