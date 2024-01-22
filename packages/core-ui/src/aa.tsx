import {
  Routes as BrowserRoutes,
  Route,
  BrowserRouter as Router,
  useLocation,
} from 'react-router-dom';

import AA from './bb';
import AuthRoutes from './modules/auth/routes';
import { IUser } from 'modules/auth/types';
import React from 'react';
import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';

const Unsubscribe = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Unsubscribe" */ 'modules/auth/containers/Unsubscribe'
    ),
);

export const UnsubscribeComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Unsubscribe queryParams={queryParams} />;
};

const BB: React.FunctionComponent<any> = ({ text }: { text: string }) => {
  return <div>{text} hiiii</div>;
};

export default AA(BB);
