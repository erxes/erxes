import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IRouterProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React, { useEffect } from 'react';
import DashbaordForm from '../containers/DashboardForm';
import { IDashboard } from '../types';

type Props = {
  queryParams: any;
  dashboard: IDashboard;
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
        `/dashboard/${localStorage.getItem('erxes_recent_dashboard')}${
          window.location.search
        }`
      );
    }

    if (!props.loading && props.dashboards.length > 0) {
      return props.history.replace(
        `/dashboard/${props.dashboards[0]._id}${window.location.search}`
      );
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
          extra={<DashbaordForm {...props} />}
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
