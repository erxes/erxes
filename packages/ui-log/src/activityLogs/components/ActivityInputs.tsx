import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';

import { EmptyContent } from '../styles';
import ErrorBoundary from '@erxes/ui/src/components/ErrorBoundary';
import Icon from '@erxes/ui/src/components/Icon';
import NoteForm from '@erxes/ui-internalnotes/src/containers/Form';
import React from 'react';
import { WhiteBoxRoot } from '@erxes/ui/src/layout/styles';
import { __ } from '@erxes/ui/src/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { isEnabled } from '@erxes/ui/src/utils/core';
import path from 'path';

const TicketCommentForm = asyncComponent(
  () =>
    isEnabled('cards') &&
    path.resolve(
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
      currentTab: 'newNote'
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

    if (currentTab === 'ticket' && isEnabled('cards')) {
      return (
        <TicketCommentForm
          contentType={`${contentType}_comment`}
          contentTypeId={contentTypeId}
        />
      );
    }

    return (
      <EmptyContent>
        <img src="/images/actions/automation.svg" alt="empty-img" />

        <p>
          <b>{'You don’t have any activity logs yet'}.</b>
          {__(
            'Automatically execute repetitive tasks and make sure nothing falls through the cracks'
          )}
          .
        </p>
      </EmptyContent>
    );
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

            {this.renderExtraTab()}
          </Tabs>

          {this.renderTabContent()}
        </WhiteBoxRoot>
      </ErrorBoundary>
    );
  }
}

export default ActivityInputs;
