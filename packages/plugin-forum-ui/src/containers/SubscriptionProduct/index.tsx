import React, { FC } from 'react';
import List from './List';
import { useQuery } from 'react-apollo';
import { Switch, Route, Link, useRouteMatch } from 'react-router-dom';
import PaymentTest from './PaymentTest';

const SubscriptionProductHome: FC = () => {
  return (
    <div>
      <Link to={'/forums/subscription-products/new'}>Create new product</Link>

      <List />

      <PaymentTest />
    </div>
  );
};

export default SubscriptionProductHome;
