import { getEnv } from 'apolloClient';
import { BoardContainer, BoardContent } from 'modules/boards/styles/common';
import { PageHeader } from 'modules/boards/styles/header';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import { __, confirm } from 'modules/common/utils';
import Header from 'modules/layout/components/Header';
import React from 'react';
import { Link } from 'react-router-dom';
import DashbaordForm from '../containers/DashboardForm';
import { RightActions, Title } from '../styles';
import { IDashboard } from '../types';

const { REACT_APP_DASHBOARD_URL } = getEnv();

type Props = {
  id: string;
  dashboard: IDashboard;
  removeDashboard: () => void;
};
type State = {
  show: boolean;
};

class DashboardDetail extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      show: false
    };
  }

  showPopup = () => {
    const { show } = this.state;

    this.setState({
      show: show ? false : true
    });
  };

  remove = () => {
    const { removeDashboard } = this.props;

    confirm().then(() => {
      removeDashboard();
    });
  };

  render() {
    const { id, dashboard } = this.props;
    const { show } = this.state;

    const renderAddForm = () => {
      return (
        <DashbaordForm
          show={show}
          closeModal={this.showPopup}
          dashboard={dashboard}
        />
      );
    };

    const leftActionBar = (
      <Title onClick={this.showPopup}>
        {dashboard.name}
        <Icon icon="pen-1" />
      </Title>
    );

    const rightActionBar = (
      <RightActions>
        <Button
          onClick={this.remove}
          btnStyle="simple"
          uppercase={false}
          icon="times-circle"
        >
          Remove
        </Button>
        <Link to={`/dashboard/explore/${id}`}>
          <Button uppercase={false} btnStyle="primary" icon="plus-circle">
            Add chart
          </Button>
        </Link>
      </RightActions>
    );

    return (
      <BoardContainer>
        {renderAddForm()}
        <Header
          title={`${'Dashboard' || ''}`}
          breadcrumb={[{ title: __('Dashboard'), link: '/dashboard' }]}
        />

        <BoardContent transparent={true} bgColor="transparent">
          <PageHeader>
            {leftActionBar}
            {rightActionBar}
          </PageHeader>
          <iframe
            title="dashboard"
            width="100%"
            height="100%"
            src={`${REACT_APP_DASHBOARD_URL}/details/${id}`}
            frameBorder="0"
            allowFullScreen={true}
          />
        </BoardContent>
      </BoardContainer>
    );
  }
}

export default DashboardDetail;
