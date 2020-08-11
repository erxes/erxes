import Wrapper from 'modules/layout/components/Wrapper';

import { __ } from 'modules/common/utils';
import React from 'react';
import DashboardList from '../containers/DashboardList';

type Props = {
  queryParams: any;
};

class Home extends React.Component<Props> {
  renderContent = () => {
    return (
      <>
        <DashboardList queryParams={this.props.queryParams} />
      </>
    );
  };

  render() {
    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={`${'Dashboard' || ''}`}
            breadcrumb={[{ title: __('Dashboard'), link: '/dashboard' }]}
          />
        }
        content={this.renderContent()}
      />
    );
  }
}

export default Home;
