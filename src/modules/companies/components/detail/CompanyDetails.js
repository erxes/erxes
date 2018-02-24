import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Wrapper } from 'modules/layout/components';
import { WhiteBox } from 'modules/layout/styles';
import { Tabs, TabTitle, Icon } from 'modules/common/components';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import {
  ActivityList,
  InternalNotes,
  ConversationList
} from 'modules/activityLogs/components';
import LeftSidebar from './LeftSidebar';

const propTypes = {
  company: PropTypes.object.isRequired,
  customFields: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired,
  queryParams: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  companyActivityLog: PropTypes.array.isRequired,
  history: PropTypes.object
};

class CompanyDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = { currentTab: 'activity' };

    this.onTabClick = this.onTabClick.bind(this);
  }

  onTabClick(currentTab) {
    this.setState({ currentTab });
  }

  renderTabContent() {
    const { currentTab } = this.state;
    const { currentUser, companyActivityLog } = this.props;

    if (currentTab === 'activity') {
      return (
        <ActivityList user={currentUser} activities={companyActivityLog} />
      );
    }

    if (currentTab === 'notes') {
      return <InternalNotes activityLog={companyActivityLog} />;
    }

    if (currentTab === 'conversations') {
      return this.renderConversations();
    }
  }

  renderConversations() {
    const { companyActivityLog, company, history } = this.props;

    return (
      <WhiteBox>
        <ConversationList
          activityLog={companyActivityLog}
          detail={company}
          history={history}
        />
      </WhiteBox>
    );
  }

  render() {
    const { currentTab } = this.state;
    const { company } = this.props;
    const { __ } = this.context;

    const breadcrumb = [
      { title: 'Companies', link: '/companies' },
      { title: company.name || company.email || 'N/A' }
    ];

    const content = (
      <div>
        <WhiteBox>
          <Tabs>
            <TabTitle className="active">
              <Icon icon="compose" /> {__('New note')}
            </TabTitle>
          </Tabs>

          <NoteForm contentType="company" contentTypeId={company._id} />
        </WhiteBox>

        <Tabs grayBorder>
          <TabTitle
            className={currentTab === 'activity' ? 'active' : ''}
            onClick={() => this.onTabClick('activity')}
          >
            {__('Activity')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'notes' ? 'active' : ''}
            onClick={() => this.onTabClick('notes')}
          >
            {__('Notes')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'conversations' ? 'active' : ''}
            onClick={() => this.onTabClick('conversations')}
          >
            {__('Conversation')}
          </TabTitle>
        </Tabs>

        {this.renderTabContent()}
      </div>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        leftSidebar={<LeftSidebar {...this.props} />}
        content={content}
        transparent={true}
      />
    );
  }
}

CompanyDetails.propTypes = propTypes;
CompanyDetails.contextTypes = {
  __: PropTypes.func
};

export default withRouter(CompanyDetails);
