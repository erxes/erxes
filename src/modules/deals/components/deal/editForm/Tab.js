import * as React from 'react';
import PropTypes from 'prop-types';
import { hasAnyActivity } from 'modules/customers/utils';
import {
  DataWithLoader,
  Icon,
  Tabs,
  TabTitle
} from 'modules/common/components';
import { Form as NoteForm } from 'modules/internalNotes/containers';
import { ActivityList } from 'modules/activityLogs/components';
import { WhiteBox } from 'modules/layout/styles';
import { Left } from '../../../styles/deal';
import { ActivityContent } from 'modules/common/styles/main';

const propTypes = {
  deal: PropTypes.object.isRequired,
  dealActivityLog: PropTypes.array,
  loadingLogs: PropTypes.bool
};

const contextTypes = {
  __: PropTypes.func,
  currentUser: PropTypes.object
};

const defaultProps = {
  dealActivityLog: [],
  loadingLogs: false
};

class Tab extends React.Component {
  constructor(props) {
    super(props);

    this.onTabClick = this.onTabClick.bind(this);

    this.state = { currentTab: 'activity' };
  }

  onTabClick(currentTab) {
    this.setState({ currentTab });
  }

  renderTabContent() {
    const { currentTab } = this.state;
    const { dealActivityLog, deal, loadingLogs } = this.props;
    const { currentUser } = this.context;
    const hasActivity = hasAnyActivity(dealActivityLog);

    return (
      <ActivityContent isEmpty={!hasActivity}>
        <DataWithLoader
          loading={loadingLogs}
          count={!loadingLogs && hasActivity ? 1 : 0}
          data={
            <ActivityList
              user={currentUser}
              activities={dealActivityLog}
              target={deal.name}
              type={currentTab} //show logs filtered by type
            />
          }
          emptyText="No Activities"
          emptyImage="/images/robots/robot-03.svg"
        />
      </ActivityContent>
    );
  }

  render() {
    const { deal } = this.props;
    const { currentTab } = this.state;
    const { __ } = this.context;

    return (
      <Left>
        <WhiteBox>
          <Tabs>
            <TabTitle className="active">
              <Icon icon="compose" /> {__('New note')}
            </TabTitle>
          </Tabs>

          <NoteForm contentType="deal" contentTypeId={deal._id} />
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
        </Tabs>

        {this.renderTabContent()}
      </Left>
    );
  }
}

Tab.propTypes = propTypes;
Tab.defaultProps = defaultProps;
Tab.contextTypes = contextTypes;

export default Tab;
