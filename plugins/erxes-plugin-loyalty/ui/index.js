import React from 'react';
import LoyaltySectionContainer from './containers/LoyaltySection';
import CustomerLoyalties from './containers/CustomerLoyalties';
import Settings from './containers/Settings';

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
      path: '/settings',
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
      to: '/erxes-plugin-loyalty/settings/',
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
