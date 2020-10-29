import { IRouterProps } from 'modules/common/types';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import Calendar from './containers/Calendar';

const main = (props: IRouterProps) => {
  return (
    <Calendar
      history={props.history}
      queryParams={queryString.parse(props.location.search)}
    />
  );
};

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/calendar" exact={true} key="/calendar" render={main} />
    </React.Fragment>
  );
};

export default routes;
