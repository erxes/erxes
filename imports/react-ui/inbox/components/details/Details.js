import React, { PropTypes, Component } from 'react';
import { Wrapper } from '/imports/react-ui/layout/components';
import RightSidebar from './RightSidebar';
import Conversation from '../conversation/Conversation';
import { RespondBox } from '../../containers';

const propTypes = {
  conversation: PropTypes.object.isRequired,
  messages: PropTypes.array.isRequired,
  changeStatus: PropTypes.func.isRequired,
  attachmentPreview: PropTypes.object,
  queryParams: PropTypes.object.isRequired,
  setAttachmentPreview: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
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
    this.node.scrollTop = this.node.scrollHeight;
  }

  render() {
    const { conversation, messages, attachmentPreview, setAttachmentPreview } = this.props;

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
          content={content}
          footer={
            <RespondBox conversation={conversation} setAttachmentPreview={setAttachmentPreview} />
          }
          rightSidebar={
            <RightSidebar
              conversation={conversation}
              messagesCount={messages.length}
              refetch={this.props.refetch}
            />
          }
          relative
        />
      </div>
    );
  }
}

Details.propTypes = propTypes;

export default Details;
