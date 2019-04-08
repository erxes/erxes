import { Icon, Tabs, TabTitle } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { TabContent } from 'modules/customers/styles';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import { WhiteBoxRoot } from 'modules/layout/styles';
import { MailForm } from 'modules/settings/integrations/containers/google';
import * as React from 'react';

type Props = {
  contentType: string;
  contentTypeId: string;
  showEmail: boolean;
  toEmail?: string;
  toEmails?: string[];
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
    const { contentTypeId, contentType, toEmail, showEmail } = this.props;
    const { currentTab } = this.state;

    if (currentTab === 'newNote') {
      return (
        <NoteForm contentType={contentType} contentTypeId={contentTypeId} />
      );
    }

    if (!showEmail) {
      return null;
    }

    return (
      <TabContent>
        <MailForm
          contentType={contentType}
          contentTypeId={contentTypeId}
          toEmail={toEmail}
          refetchQueries={['activityLogs']}
        />
      </TabContent>
    );
  }

  renderExtraTab() {
    if (!this.props.showEmail) {
      return null;
    }

    return (
      <TabTitle
        className={this.state.currentTab === 'email' ? 'active' : ''}
        onClick={this.onChangeTab.bind(this, 'email')}
      >
        <Icon icon="email" /> {__('Email')}
      </TabTitle>
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
