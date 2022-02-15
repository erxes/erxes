import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import Sidebar from '../../containers/conversationDetail/Sidebar';
import WorkArea from '../../containers/conversationDetail/WorkArea';
import EmptySidebar from '@erxes/ui/src/layout/components/Sidebar';
import { MainContent, ContentBox } from '@erxes/ui/src/layout/styles';
import { IField } from '@erxes/ui/src/types';
import React from 'react';
import { IConversation } from '@erxes/ui-inbox/src/inbox/types';

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
          text='Customer not found'
          size='full'
          image='/images/actions/18.svg'
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
        text='Conversation not found'
        size='full'
        image='/images/actions/14.svg'
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
