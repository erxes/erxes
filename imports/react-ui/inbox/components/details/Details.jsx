import React, { PropTypes } from 'react';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from './Sidebar.jsx';
import RightSidebar from './RightSidebar.jsx';
import Conversation from '../conversation/Conversation.jsx';
import { RespondBox } from '../../containers';


const propTypes = {
  conversation: PropTypes.object.isRequired,
  messages: PropTypes.array.isRequired,
  channelId: PropTypes.string,
  changeStatus: PropTypes.func.isRequired,
  attachmentPreview: PropTypes.object,
  setAttachmentPreview: PropTypes.func.isRequired,
};

function Details(props) {
  const {
    conversation,
    messages,
    channelId,
    changeStatus,
    attachmentPreview,
    setAttachmentPreview,
  } = props;

  const content = (
    <div className="margined">
      <Conversation
        conversation={conversation}
        messages={messages}
        attachmentPreview={attachmentPreview}
      />
    </div>
  );

  const breadcrumb = [
    { title: 'Inbox', link: '/inbox' },
    { title: 'Conversation' },
  ];

  return (
    <div>
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={
          <Sidebar
            conversation={conversation}
            messagesCount={messages.length}
            changeStatus={changeStatus}
            channelId={channelId}
          />
        }

        content={content}
        footer={
          <RespondBox
            conversation={conversation}
            setAttachmentPreview={setAttachmentPreview}
          />
        }
        rightSidebar={<RightSidebar conversation={conversation} />}
      />
    </div>
  );
}

Details.propTypes = propTypes;

export default Details;
