import { getEnv } from 'apolloClient';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';

const { REACT_APP_DASHBOARD_URL } = getEnv();

type Props = {
  id: string;
};

class DashboardDetail extends React.Component<Props, {}> {
  render() {
    const { id } = this.props;

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={`${'Dashboard' || ''}`}
            breadcrumb={[{ title: __('Dashboard') }]}
          />
        }
        content={
          <iframe
            title="dashboard"
            width="100%"
            height="100%"
            src={`${REACT_APP_DASHBOARD_URL}/explore?dashboardId=${id}`}
            frameBorder="0"
            allowFullScreen={true}
          />
        }
      />
    );
  }
}

export default DashboardDetail;
