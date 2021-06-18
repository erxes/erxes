import Button from 'modules/common/components/Button';
import { Title } from 'modules/common/styles/main';
import { __, getEnv } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Link } from 'react-router-dom';
import { RightActions } from '../styles';
import SideBar from './SideBar';

const { REACT_APP_DASHBOARD_URL } = getEnv();

type Props = {
  dashboardId: string;
  queryParams: any;
};

class InitialData extends React.Component<Props> {
  renderContent = () => {
    const { dashboardId, queryParams } = this.props;
    const { type } = queryParams;

    return (
      <iframe
        title="dashboard"
        width="100%"
        height="100%"
        style={{ position: 'absolute' }}
        src={`${REACT_APP_DASHBOARD_URL}/reports/?dashboardId=${dashboardId}&type=${type}`}
        frameBorder="0"
        allowFullScreen={true}
      />
    );
  };

  render() {
    const { dashboardId } = this.props;

    const leftActionBar = <Title>{__('Reports library')}</Title>;

    const rightActionBar = (
      <RightActions>
        <Link to={`/dashboard/explore/${dashboardId}`}>
          <Button uppercase={false} btnStyle="success" icon="plus-circle">
            Create custom charts
          </Button>
        </Link>
      </RightActions>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={`${__('Dashboard') || ''}`}
            breadcrumb={[
              { title: __('Dashboard'), link: '/dashboard' },
              { title: __('Reports library') }
            ]}
          />
        }
        actionBar={
          <Wrapper.ActionBar left={leftActionBar} right={rightActionBar} />
        }
        leftSidebar={<SideBar dashboardId={this.props.dashboardId} />}
        content={this.renderContent()}
      />
    );
  }
}

export default InitialData;
