import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import Sidebar from 'modules/inbox/containers/conversationDetail/Sidebar';
import WorkArea from 'modules/inbox/containers/conversationDetail/WorkArea';
import EmptySidebar from 'modules/layout/components/Sidebar';
import { MainContent } from 'modules/layout/styles';
import { ContentBox } from 'modules/layout/styles';
import { IField } from 'modules/settings/properties/types';
import React from 'react';
import { IConversation } from '../../types';

type Props = {
  currentConversation: IConversation;
  loading: boolean;
  conversationFields: IField[];
  refetchDetail: () => void;
};

export default class ConversationDetail extends React.Component<Props> {
  renderSidebar() {
    const { loading, currentConversation, conversationFields } = this.props;

    if (currentConversation) {
      return (
        <Sidebar
          conversation={currentConversation}
          conversationFields={conversationFields}
        />
      );
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
