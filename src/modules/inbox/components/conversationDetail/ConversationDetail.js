import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { MainContent } from 'modules/layout/styles';
import { Sidebar as EmptySidebar } from 'modules/layout/components';
import { EmptyState, Spinner } from 'modules/common/components';
import { WorkArea, Sidebar } from 'modules/inbox/containers/conversationDetail';
import { ContentBox } from 'modules/layout/styles';

export default class ConversationDetail extends Component {
  renderSidebar() {
    const { loading, currentConversation } = this.props;

    if (currentConversation) {
      return <Sidebar conversation={currentConversation} />;
    }

    if (loading) {
      return (
        <EmptySidebar full>
          <Spinner />
        </EmptySidebar>
      );
    }

    return (
      <EmptySidebar full>
        <EmptyState
          text="Customer not found"
          size="small"
          image="/images/robots/robot-02.svg"
        />
      </EmptySidebar>
    );
  }

  renderContent() {
    const { loading, currentConversation } = this.props;

    if (currentConversation) {
      return <WorkArea {...this.props} />;
    }

    if (loading) {
      return (
        <ContentBox>
          <Spinner />
        </ContentBox>
      );
    }

    return (
      <EmptyState
        text="Conversation not found"
        size="full"
        image="/images/robots/robot-02.svg"
      />
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
  currentConversation: PropTypes.object,
  loading: PropTypes.bool
};
