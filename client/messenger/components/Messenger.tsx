import * as React from 'react';
import {
  ConversationList,
  ConversationCreate,
  ConversationDetail,
  AccquireInformation,
} from '../containers';

type Props = {
  activeRoute: string | '',
};

function Messenger({ activeRoute }: Props) {
  switch (activeRoute) {
    case 'conversationDetail':
      return <ConversationDetail />;

    case 'conversationCreate':
      return <ConversationCreate />;

    case 'conversationList':
      return <ConversationList />;

    // get user's contact information
    case 'accquireInformation':
      return <AccquireInformation />;

    default:
      return <div />
  }
}

export default Messenger;