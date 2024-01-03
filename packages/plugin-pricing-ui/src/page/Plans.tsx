import React from 'react';
// erxes
import { Pagination, Spinner, __ } from '@erxes/ui/src';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
// local
import { gql, useQuery } from '@apollo/client';
import queryString from 'query-string';
import ActionBar from '../components/plan/Actionbar';
import Sidebar from '../components/plan/Sidebar';
import { SUBMENU } from '../constants';
import List from '../containers/plan/List';
import { queries } from '../graphql';

const Plans = () => {
  const query = queryString.parse(location.search);
  const params = {
    ...query,
    isQuantityEnabled:
      (query.isQuantityEnabled === 'true' &&
        Boolean(query.isQuantityEnabled)) ||
      undefined,
    isPriceEnabled:
      (query.isPriceEnabled === 'true' && Boolean(query.isPriceEnabled)) ||
      undefined,
    isExpiryEnabled:
      (query.isExpiryEnabled === 'true' && Boolean(query.isExpiryEnabled)) ||
      undefined,
    isRepeatEnabled:
      (query.isRepeatEnabled === 'true' && Boolean(query.isRepeatEnabled)) ||
      undefined,
    perPage: query.perPage && Number(query.perPage),
    page: query.page && Number(query.page)
  };

  const plansCount = useQuery(gql(queries.pricingPlansCount), {
    variables: { ...params },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true
  });

  if (plansCount.loading) {
    return <Spinner />;
  }

  const count = Number(plansCount.data ? plansCount.data.pricingPlansCount : 0);

  return (
    <Wrapper
      header={<Wrapper.Header title={__('Pricing Plans')} submenu={SUBMENU} />}
      content={<List count={count} params={params} />}
      footer={<Pagination count={count} />}
      actionBar={<ActionBar count={count} />}
      leftSidebar={<Sidebar params={params} />}
      transparent
      hasBorder
    />
  );
};

export default Plans;
