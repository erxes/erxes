import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Header } from 'modules/layout/components';
import { Contents } from 'modules/layout/styles';
import { ConversationDetail } from '../containers/conversationDetail';
import { Sidebar } from '../containers/leftSidebar';

export default class Inbox extends Component {
  render() {
    const { currentConversationId, queryParams } = this.props;
    const { __ } = this.context;

    const breadcrumb = [{ title: __('Inbox') }];

    return (
      <Contents>
        <Header queryParams={queryParams} breadcrumb={breadcrumb} />
        <Sidebar
          queryParams={queryParams}
          currentConversationId={currentConversationId}
        />
        <ConversationDetail currentId={currentConversationId} />
      </Contents>
    );
  }
}

Inbox.propTypes = {
  queryParams: PropTypes.object,
  currentConversationId: PropTypes.string
};

Inbox.contextTypes = {
  __: PropTypes.func
};
