import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { MainContent } from 'modules/layout/styles';
import { Sidebar as EmptySidebar } from 'modules/layout/components';
import { Spinner } from 'modules/common/components';
import { WorkArea, Sidebar } from 'modules/inbox/containers/conversationDetail';
import { ContentBox } from 'modules/layout/styles';

export default class ConversationDetail extends Component {
  renderSidebar() {
    const { currentConversation } = this.props;

    if (currentConversation.customerId) {
      return <Sidebar conversation={currentConversation} />;
    }

    return (
      <EmptySidebar full>
        <Spinner />
      </EmptySidebar>
    );
  }

  renderContent() {
    const { currentConversation } = this.props;

    if (currentConversation._id) {
      return <WorkArea {...this.props} />;
    }

    return (
      <ContentBox>
        <Spinner />
      </ContentBox>
    );
  }

  render() {
    return (
      <Fragment>
        <MainContent>{this.renderContent()}</MainContent>
        {this.renderSidebar()}
      </Fragment>
    );
  }
}

ConversationDetail.propTypes = {
  currentConversation: PropTypes.object
};
