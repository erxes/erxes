import React from 'react';
import LoyaltySectionContainer from './containers/LoyaltySection';
import CustomerLoyalties from './containers/CustomerLoyalties';
import Settings from './containers/configs/Settings';

const customerLoyalties = ({ match }) => {
  const customerId = match.params.customerId;

  return <CustomerLoyalties customerId={customerId} />;
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
      component: Settings
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
