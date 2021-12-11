import queryString from 'query-string';
import React from 'react';
import LoyaltySectionContainer from './loyalties/containers/LoyaltySection';
import CustomerLoyalties from './loyalties/containers/CustomerLoyalties';
import Settings from './configs/general/containers/Settings';
import VoucherCompaigns from './configs/voucherCompaign/containers/List';
import DonateCompaigns from './configs/donateCompaign/containers/List';
import LotteryCompaigns from './configs/lotteryCompaign/containers/List';
import SpinCompaigns from './configs/spinCompaign/containers/List';

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
const lotteryCompaignList = ({ location, history }) => {
  return (
    <LotteryCompaigns
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const spinCompaignList = ({ location, history }) => {
  return (
    <SpinCompaigns
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const donateCompaignList = ({ location, history }) => {
  return (
    <DonateCompaigns
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
      path: '/settings/lottery',
      component: lotteryCompaignList
    },
    {
      path: '/settings/spin',
      component: spinCompaignList
    },
    {
      path: '/settings/donate',
      component: donateCompaignList
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
