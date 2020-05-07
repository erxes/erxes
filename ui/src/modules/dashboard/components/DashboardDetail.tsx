import Button from 'modules/common/components/Button';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Link } from 'react-router-dom';

type Props = {
  id: string;
};

class DashboardDetail extends React.Component<Props, {}> {
  render() {
    const { id } = this.props;

    const rightActionBar = (
      <Link to={`/dashboard/explore/${id}`}>
        <Button btnStyle="primary" size="small" icon="arrow-from-right">
          Add chart
        </Button>
      </Link>
    );

    const actionBar = <Wrapper.ActionBar right={rightActionBar} />;

    return (
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
            src={`http://localhost:3500/details/${id}`}
            frameBorder="0"
            allowFullScreen={true}
          />
        }
      />
    );
  }
}

export default DashboardDetail;
