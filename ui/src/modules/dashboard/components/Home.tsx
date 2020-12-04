import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { IRouterProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React, { useEffect } from 'react';
import DashbaordForm from '../containers/DashboardForm';
import { IDashboard } from '../types';

type Props = {
  queryParams: any;
  dashboards: IDashboard[];
  loading: boolean;
};

type FinalProps = {} & Props & IRouterProps;

const Home = (props: FinalProps) => {
  useEffect(() => {
    if (
      !props.loading &&
      props.dashboards.length > 0 &&
      localStorage.getItem('erxes_recent_dashboard')
    ) {
      return props.history.replace(
        `/dashboard/${localStorage.getItem('erxes_recent_dashboard')}`
      );
    }

    if (!props.loading && props.dashboards.length > 0) {
      return props.history.replace(`/dashboard/${props.dashboards[0]._id}`);
    }
  });

  if (props.loading) {
    return <Spinner />;
  }

  if (props.dashboards.length === 0) {
    return (
      <>
        <EmptyState
          image="/images/actions/8.svg"
          text="There is no Dashboard"
          size="full"
          extra={<DashbaordForm />}
        />
      </>
    );
  }

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={`${'Dashboard' || ''}`}
          breadcrumb={[{ title: __('Dashboard'), link: '/dashboard' }]}
        />
      }
      content={null}
    />
  );
};

export default Home;
