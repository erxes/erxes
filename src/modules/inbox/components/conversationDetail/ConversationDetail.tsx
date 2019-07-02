import { EmptyState, Spinner } from 'modules/common/components';
import { Sidebar, WorkArea } from 'modules/inbox/containers/conversationDetail';
import { Sidebar as EmptySidebar } from 'modules/layout/components';
import { MainContent } from 'modules/layout/styles';
import { ContentBox } from 'modules/layout/styles';
import React from 'react';
import { IConversation } from '../../types';

type Props = {
  currentConversation: IConversation;
  loading: boolean;
};

export default class ConversationDetail extends React.Component<Props> {
  renderSidebar() {
    const { loading, currentConversation } = this.props;

    if (currentConversation) {
      return <Sidebar conversation={currentConversation} />;
    }

    if (loading) {
      return (
        <EmptySidebar full={true}>
          <Spinner />
        </EmptySidebar>
      );
    }

    return (
      <EmptySidebar full={true}>
        <EmptyState
          text="Customer not found"
          size="full"
          image="/images/actions/18.svg"
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
        image="/images/actions/14.svg"
      />
    );
  }

  render() {
    return (
      <React.Fragment>
        <MainContent>{this.renderContent()}</MainContent>
        {this.renderSidebar()}
      </React.Fragment>
    );
  }
}
