import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Wrapper, Sidebar } from 'modules/layout/components';
import { WhiteBox } from 'modules/layout/styles';
import {
  DataWithLoader,
  Tabs,
  TabTitle,
  Icon
} from 'modules/common/components';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import { ActivityList } from 'modules/activityLogs/components';
import LeftSidebar from './LeftSidebar';
import { CustomerAssociate } from 'modules/customers/containers';
import { DealSection } from 'modules/deals/containers';
import { hasAnyActivity } from 'modules/customers/utils';

const propTypes = {
  company: PropTypes.object.isRequired,
  fieldsGroups: PropTypes.array.isRequired,
  queryParams: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  companyActivityLog: PropTypes.array.isRequired,
  loadingLogs: PropTypes.bool.isRequired,
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
    const {
      currentUser,
      companyActivityLog,
      company,
      loadingLogs
    } = this.props;

    return (
      <div
        style={
          !hasAnyActivity(companyActivityLog)
            ? { position: 'relative', height: '400px' }
            : {}
        }
      >
        <DataWithLoader
          loading={loadingLogs}
          count={!loadingLogs && hasAnyActivity(companyActivityLog) ? 1 : 0}
          data={
            <ActivityList
              user={currentUser}
              activities={companyActivityLog}
              target={company.name}
              type={currentTab} //show logs filtered by type
            />
          }
          emptyText="No Activities"
          emptyImage="/images/robots/robot-03.svg"
        />
      </div>
    );
  }

  render() {
    const { currentTab } = this.state;
    const { company } = this.props;
    const { __ } = this.context;

    const breadcrumb = [
      { title: __('Companies'), link: '/companies' },
      { title: company.name || company.email || 'N/A' }
    ];

    const rightSidebar = (
      <Sidebar>
        <CustomerAssociate data={company} />
        <DealSection companyId={company._id} />
      </Sidebar>
    );

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
        rightSidebar={rightSidebar}
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
