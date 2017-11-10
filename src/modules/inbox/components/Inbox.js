import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RightSidebar from './RightSidebar';
import { Wrapper } from '../../layout/components';
import { Button, Label, Icon, TaggerPopover } from 'modules/common/components';
import { BarItems } from 'modules/layout/styles';
import Conversation from './conversation/Conversation';
import { LeftSidebar, RespondBox } from '../containers';
import { PopoverButton, ConversationWrapper } from '../styles';

class Inbox extends Component {
  constructor(props) {
    super(props);

    this.changeStatus = this.changeStatus.bind(this);
  }

  componentDidMount() {
    this.node.scrollTop = this.node.scrollHeight;
  }

  componentDidUpdate() {
    this.node.scrollTop = this.node.scrollHeight;
  }

  // change resolved status
  changeStatus() {
    const { currentConversation, changeStatus } = this.props;

    let status = currentConversation.status;

    if (status === 'closed') {
      status = 'open';
    } else {
      status = 'closed';
    }

    // call change status method
    changeStatus(currentConversation._id, status);
  }

  renderStatusButton(status) {
    let bsStyle = 'success';
    let text = 'Resolve';
    let icon = <i className="ion-checkmark-circled" />;

    if (status === 'closed') {
      text = 'Open';
      bsStyle = 'warning';
      icon = <i className="ion-refresh" />;
    }

    return (
      <Button bsStyle={bsStyle} onClick={this.changeStatus} size="small">
        {icon} {text}
      </Button>
    );
  }

  render() {
    const { currentConversation, onChangeConversation } = this.props;

    const actionBarLeft = <BarItems>Alice Caldwell</BarItems>;

    const tagTrigger = (
      <PopoverButton>
        <Label lblStyle="danger">urgent</Label>
        <Icon icon="ios-arrow-down" />
      </PopoverButton>
    );

    const actionBarRight = (
      <BarItems>
        <TaggerPopover
          targets={[currentConversation]}
          type="conversation"
          trigger={tagTrigger}
        />

        {this.renderStatusButton(
          currentConversation && currentConversation.status
        )}
      </BarItems>
    );

    const actionBar = (
      <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} invert />
    );

    const content = (
      <ConversationWrapper
        ref={node => {
          this.node = node;
        }}
      >
        <Conversation conversation={currentConversation} />
      </ConversationWrapper>
    );

    const breadcrumb = [
      { title: 'Inbox', link: '/inbox' },
      { title: 'Conversation' }
    ];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={actionBar}
        content={content}
        footer={
          currentConversation ? (
            <RespondBox
              conversation={currentConversation}
              setAttachmentPreview={() => {}}
            />
          ) : null
        }
        leftSidebar={
          <LeftSidebar onChangeConversation={onChangeConversation} />
        }
        rightSidebar={<RightSidebar />}
      />
    );
  }
}

Inbox.propTypes = {
  title: PropTypes.string,
  onChangeConversation: PropTypes.func,
  changeStatus: PropTypes.func,
  currentConversation: PropTypes.object
};

export default Inbox;
