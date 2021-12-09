import queryString from 'query-string';
import React from 'react';
import LoyaltySectionContainer from './loyalties/containers/LoyaltySection';
import CustomerLoyalties from './loyalties/containers/CustomerLoyalties';
import Settings from './configs/general/containers/Settings';
import VoucherCompaigns from './configs/voucherCompaign/containers/List';

const customerLoyalties = ({ match }) => {
  const customerId = match.params.customerId;

  return <CustomerLoyalties customerId={customerId} />;
};

const voucherCompaignList = ({ location, history }) => {
  return (
    <VoucherCompaigns
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

export default () => ({
  routes: [
    {
      path: '/list/:customerId',
      component: customerLoyalties
    },
    {
      path: '/settings/general',
      component: Settings
    },
    {
      path: '/settings/voucher',
      component: voucherCompaignList
    },
    {
      path: '/settings/donate',
      component: Settings
    }
  ],
  customerRightSidebarSection: {
    section: LoyaltySectionContainer,
  },
  settings: [
    {
      name: 'Loyalty config',
      image: '/images/icons/erxes-16.svg',
      to: '/erxes-plugin-loyalty/settings/general',
      action: 'loyaltyConfig',
      permissions: [],
    }
  ],
  payments: [
    {
      name: 'loyalty',
      title: 'Used Loyalty'
    }
  ]
});
