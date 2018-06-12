import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LeftSidebar, ConversationDetail } from '../containers';
import { Header } from 'modules/layout/components';
import { Contents } from 'modules/layout/styles';

export default class Inbox extends Component {
  render() {
    const { currentConversationId, queryParams } = this.props;
    const { __ } = this.context;

    const breadcrumb = [{ title: __('Inbox') }];

    return (
      <Contents>
        <Header queryParams={queryParams} breadcrumb={breadcrumb} />
        <LeftSidebar currentConversationId={currentConversationId} />
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
