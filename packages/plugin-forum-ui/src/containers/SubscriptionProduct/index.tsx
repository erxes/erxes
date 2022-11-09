import React, { FC } from 'react';
import List from './List';
import { useQuery } from 'react-apollo';
import { Switch, Route, Link, useRouteMatch } from 'react-router-dom';

const SubscriptionProductHome: FC = () => {
  return (
    <div>
      <Link to={'/forums/subscription-products/new'}>Create new product</Link>

      <List />
    </div>
  );
};

export default SubscriptionProductHome;
