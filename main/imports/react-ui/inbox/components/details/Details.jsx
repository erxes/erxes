import React, { PropTypes } from 'react';
import { Wrapper } from '/imports/react-ui/layout/components';
import Sidebar from './Sidebar.jsx';
import RightSidebar from './RightSidebar.jsx';
import Conversation from '../conversation/Conversation.jsx';
import { RespondBox } from '../../containers';


const propTypes = {
  ticket: PropTypes.object.isRequired,
  comments: PropTypes.array.isRequired,
  channelId: PropTypes.string,
  changeStatus: PropTypes.func.isRequired,
  attachmentPreview: PropTypes.object,
  setAttachmentPreview: PropTypes.func.isRequired,
};

function Details(props) {
  const {
    ticket,
    comments,
    channelId,
    changeStatus,
    attachmentPreview,
    setAttachmentPreview,
  } = props;

  const content = (
    <div className="margined">
      <Conversation
        ticket={ticket}
        messages={comments}
        attachmentPreview={attachmentPreview}
      />
    </div>
  );

  const breadcrumb = [
    { title: 'Inbox', link: '/inbox' },
    { title: 'Ticket' },
  ];

  return (
    <div>
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={
          <Sidebar
            ticket={ticket}
            commentsCount={comments.length}
            changeStatus={changeStatus}
            channelId={channelId}
          />
        }

        content={content}
        footer={
          <RespondBox
            ticket={ticket}
            setAttachmentPreview={setAttachmentPreview}
          />
        }
        rightSidebar={<RightSidebar ticket={ticket} />}
      />
    </div>
  );
}

Details.propTypes = propTypes;

export default Details;
