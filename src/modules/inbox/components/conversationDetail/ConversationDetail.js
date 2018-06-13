import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { MainContent } from 'modules/layout/styles';
import { WorkArea, Sidebar } from 'modules/inbox/containers/conversationDetail';

export default class ConversationDetail extends Component {
  render() {
    const { currentConversation } = this.props;

    return (
      <Fragment>
        <MainContent>
          <WorkArea {...this.props} />
        </MainContent>
        {currentConversation.customerId && (
          <Sidebar conversation={currentConversation} />
        )}
      </Fragment>
    );
  }
}

ConversationDetail.propTypes = {
  currentConversation: PropTypes.object
};
