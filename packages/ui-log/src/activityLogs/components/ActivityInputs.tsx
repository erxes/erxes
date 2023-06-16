import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';

import ErrorBoundary from '@erxes/ui/src/components/ErrorBoundary';
import Icon from '@erxes/ui/src/components/Icon';
import NoteForm from '@erxes/ui-internalnotes/src/containers/Form';
import CommentForm from '@erxes/ui-cards/src/comment/containers/Form';
import React from 'react';
import { WhiteBoxRoot } from '@erxes/ui/src/layout/styles';
import { __ } from '@erxes/ui/src/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { isEnabled } from '@erxes/ui/src/utils/core';

const TicketCommentForm = asyncComponent(
  () =>
    isEnabled('cards') &&
    import(
      /* webpackChunkName: "TicketCommentForm" */ '@erxes/ui-cards/src/boards/containers/TicketCommentForm'
    )
);

type Props = {
  contentType: string;
  contentTypeId: string;
  showEmail: boolean;
  toEmail?: string;
  toEmails?: string[];
  extraTabs?: React.ReactNode;
};

type State = {
  currentTab: string;
};

class ActivityInputs extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: isEnabled('internalnotes')
        ? 'newNote'
        : isEnabled('clientportal')
        ? 'newComment'
        : ''
    };
  }

  onChangeTab = currentTab => {
    this.setState({ currentTab });
  };

  renderTabContent() {
    const { contentTypeId, contentType } = this.props;
    const { currentTab } = this.state;

    if (currentTab === 'newNote' && isEnabled('internalnotes')) {
      return (
        <NoteForm contentType={contentType} contentTypeId={contentTypeId} />
      );
    }

    if (currentTab === 'newComment' && isEnabled('clientportal')) {
      return (
        <CommentForm contentType={contentType} contentTypeId={contentTypeId} />
      );
    }

    if (currentTab === 'ticket' && isEnabled('cards')) {
      return (
        <TicketCommentForm
          contentType={`${contentType}_comment`}
          contentTypeId={contentTypeId}
        />
      );
    }

    return null;
  }

  renderTabTitle(type: string, icon: string, title: string) {
    const currentTab = this.state.currentTab;

    return (
      <TabTitle
        key={Math.random()}
        className={currentTab === type ? 'active' : ''}
        onClick={this.onChangeTab.bind(this, type)}
      >
        <Icon icon={icon} /> {__(title)}
      </TabTitle>
    );
  }

  renderExtraTab() {
    const { showEmail, extraTabs, contentType } = this.props;
    const tabs: any = [];

    if (showEmail) {
      tabs.push(this.renderTabTitle('email', 'envelope-add', 'Email'));
    }

    if (contentType === 'ticket') {
      tabs.push(this.renderTabTitle('ticket', 'ticket', 'Ticket reply'));
    }

    return (
      <>
        {tabs}
        {extraTabs}
      </>
    );
  }

  render() {
    return (
      <ErrorBoundary>
        <WhiteBoxRoot>
          <Tabs>
            {isEnabled('internalnotes') &&
              this.renderTabTitle('newNote', 'file-plus', 'New note')}

            {isEnabled('clientportal') &&
              this.renderTabTitle('newComment', 'comment-plus', 'New comment')}

            {this.renderExtraTab()}
          </Tabs>

          {this.renderTabContent()}
        </WhiteBoxRoot>
      </ErrorBoundary>
    );
  }
}

export default ActivityInputs;
