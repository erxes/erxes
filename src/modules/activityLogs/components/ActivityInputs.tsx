import { Icon, Tabs, TabTitle } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import { WhiteBoxRoot } from 'modules/layout/styles';
import React from 'react';

type Props = {
  contentType: string;
  contentTypeId: string;
  showEmail: boolean;
  toEmail?: string;
  toEmails?: string[];
  extraTab?: React.ReactNode;
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
    const { contentTypeId, contentType, showEmail } = this.props;
    const { currentTab } = this.state;

    if (currentTab === 'newNote') {
      return (
        <NoteForm contentType={contentType} contentTypeId={contentTypeId} />
      );
    }

    if (!showEmail) {
      return null;
    }

    return null;
  }

  renderExtraTab() {
    const { showEmail, extraTab } = this.props;
    let tabEmail;

    if (showEmail) {
      tabEmail = (
        <TabTitle
          className={this.state.currentTab === 'email' ? 'active' : ''}
          onClick={this.onChangeTab.bind(this, 'email')}
        >
          <Icon icon="email" /> {__('Email')}
        </TabTitle>
      );
    }

    return (
      <>
        {tabEmail}
        {extraTab}
      </>
    );
  }

  render() {
    const { currentTab } = this.state;

    return (
      <WhiteBoxRoot>
        <Tabs>
          <TabTitle
            className={currentTab === 'newNote' ? 'active' : ''}
            onClick={this.onChangeTab.bind(this, 'newNote')}
          >
            <Icon icon="edit-1" /> {__('New note')}
          </TabTitle>

          {this.renderExtraTab()}
        </Tabs>

        {this.renderTabContent()}
      </WhiteBoxRoot>
    );
  }
}

export default ActivityInputs;
