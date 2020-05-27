import { getEnv } from 'apolloClient';
import Button from 'modules/common/components/Button';
import { Title } from 'modules/common/styles/main';
import { __, confirm } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Link } from 'react-router-dom';
import DashbaordForm from '../containers/DashboardForm';
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
      <Title onClick={this.showPopup}>{dashboard.name}</Title>
    );

    const rightActionBar = (
      <>
        <Link to={`/dashboard/explore/${id}`}>
          <Button btnStyle="primary" size="small" icon="plus-circle">
            Add chart
          </Button>
        </Link>
        <Button
          onClick={this.remove}
          btnStyle="danger"
          size="small"
          icon="cancel-1"
        >
          Remove
        </Button>
      </>
    );

    const actionBar = (
      <Wrapper.ActionBar right={rightActionBar} left={leftActionBar} />
    );

    return (
      <>
        {renderAddForm()}
        <Wrapper
          header={
            <Wrapper.Header
              title={`${'Dashboard' || ''}`}
              breadcrumb={[{ title: __('Dashboard'), link: '/dashboard' }]}
            />
          }
          actionBar={actionBar}
          content={
            <iframe
              title="dashboard"
              width="100%"
              height="100%"
              src={`${REACT_APP_DASHBOARD_URL}/details/${id}`}
              frameBorder="0"
              allowFullScreen={true}
            />
          }
        />
      </>
    );
  }
}

export default DashboardDetail;
