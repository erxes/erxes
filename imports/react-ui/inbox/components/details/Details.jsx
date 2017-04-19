import React, { PropTypes, Component } from 'react';
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

class Details extends Component {
  componentDidMount() {
    this.node.scrollTop = this.node.scrollHeight;
  }

  componentWillUpdate() {
    const { node } = this;
    this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      this.node.scrollTop = this.node.scrollHeight;
    }
  }

  render() {
    const {
      conversation,
      messages,
      channelId,
      changeStatus,
      attachmentPreview,
      setAttachmentPreview,
    } = this.props;

    const content = (
      <div
        className="scroll-area"
        ref={node => {
          this.node = node;
        }}
      >
        <div className="margined">
          <Conversation
            conversation={conversation}
            messages={messages}
            attachmentPreview={attachmentPreview}
          />
        </div>
      </div>
    );

    const breadcrumb = [{ title: 'Inbox', link: '/inbox' }, { title: 'Conversation' }];

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
            <RespondBox conversation={conversation} setAttachmentPreview={setAttachmentPreview} />
          }
          rightSidebar={<RightSidebar conversation={conversation} />}
        />
      </div>
    );
  }
}

Details.propTypes = propTypes;

export default Details;
