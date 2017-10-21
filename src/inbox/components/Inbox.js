import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RightSidebar from './RightSidebar';
import LeftSidebar from './LeftSidebar';
import { Wrapper } from '../../layout/components';

class Inbox extends Component {
  render() {
    const { conversations, messages, user } = this.props;
    const actionBarLeft = (
      <div>
        Alice Caldwell
      </div>
    );

    const actionBarRight = (
      <div>
        Resolve
      </div>
    );

    const actionBar = <Wrapper.ActionBar left={actionBarLeft} right={actionBarRight} />;

    const content = (
      <div
        className="scroll-area"
        ref={node => {
          this.node = node;
        }}
      >
        {messages} {this.props.title}
      </div>
    );

    const breadcrumb = [{ title: 'Inbox', link: '/inbox' }, { title: 'Conversation' }];

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={actionBar}
        content={content}
        footer={<div />}
        leftSidebar={<LeftSidebar conversations={conversations} />}
        rightSidebar={<RightSidebar user={user} />}
      />
    );
  }
}

Inbox.propTypes = {
  title: PropTypes.string,
  conversations: PropTypes.array.isRequired,
  messages: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
};

export default Inbox;
