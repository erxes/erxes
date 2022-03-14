import { BoardContent, BoardContainer } from '@erxes/ui-cards/src/boards/styles/common';
import Button from '@erxes/ui/src/components/Button';
import DropdownToggle from '@erxes/ui/src/components/DropdownToggle';
import Icon from '@erxes/ui/src/components/Icon';
import { __, getEnv } from 'coreui/utils';
import Header from '@erxes/ui/src/layout/components/Header';
import React from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { Link } from 'react-router-dom';
import DashboardList from '../containers/DashboardList';
import { Header as PageHeader, RightActions, Title } from '../styles';
import { IDashboard } from '../types';

const { REACT_APP_DASHBOARD_URL } = getEnv();

type Props = {
  id: string;
  dashboard: IDashboard;
  dashboards: IDashboard[];
  isExplore?: boolean;
};

type State = {
  show: boolean;
};

class DashboardDetail extends React.Component<Props, State> {
  componentDidMount() {
    if (this.props.dashboard) {
      localStorage.setItem('erxes_recent_dashboard', this.props.dashboard._id);
    }
  }

  renderContent = () => {
    const { id, isExplore } = this.props;

    if (isExplore) {
      return (
        <iframe
          title="dashboard"
          width="100%"
          height="100%"
          src={`${REACT_APP_DASHBOARD_URL}/explore?dashboardId=${id}`}
          frameBorder="0"
          allowFullScreen={true}
        />
      );
    }

    return (
      <iframe
        title="dashboard"
        width="100%"
        height="100%"
        src={`${REACT_APP_DASHBOARD_URL}/details/${id}`}
        frameBorder="0"
        allowFullScreen={true}
      />
    );
  };

  render() {
    const { id, dashboard, isExplore } = this.props;

    const trigger = (
      <Title>
        {dashboard.name}
        <Icon icon="angle-down" />
      </Title>
    );

    const renderDashboards = () => {
      return (
        <Dropdown>
          <Dropdown.Toggle as={DropdownToggle} id="dropdown-dashboard">
            {trigger}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <DashboardList currentDashboard={dashboard._id} {...this.props} />
          </Dropdown.Menu>
        </Dropdown>
      );
    };

    const rightActionBar = (
      <RightActions>
        <Link to={`/dashboard/reports/${id}`}>
          <Button btnStyle="simple" icon="plus-circle">
            Add chart from Library
          </Button>
        </Link>
        {!isExplore && (
          <Link to={`/dashboard/explore/${id}`}>
            <Button btnStyle="success" icon="plus-circle">
              Create a new chart
            </Button>
          </Link>
        )}
      </RightActions>
    );

    return (
      <BoardContainer>
        <Header
          title={`${__('Dashboard') || ''}`}
          breadcrumb={[
            { title: 'Dashboard', link: '/dashboard' },
            { title: dashboard.name || '' }
          ]}
        />

        <BoardContent transparent={true} bgColor="transparent">
          <PageHeader>
            {renderDashboards()}
            {rightActionBar}
          </PageHeader>
          {this.renderContent()}
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default DashboardDetail;
