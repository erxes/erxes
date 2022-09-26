import { IRouterProps } from '@erxes/ui/src/types';
import Main from './containers/Main';
import React from 'react';
import { Route } from 'react-router-dom';
import Schedule from './components/scheduler/Index';
import queryString from 'query-string';

const main = (props: IRouterProps) => {
  return <Main queryParams={queryString.parse(props.location.search)} />;
};

const schedule = ({ match }) => {
  const slug = match.params.slug;

  return <Schedule slug={slug} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/calendar" exact={true} key="/calendar" render={main} />

      <Route
        key="/schedule"
        exact={true}
        path="/schedule/:slug"
        component={schedule}
      />
    </React.Fragment>
  );
};

export default routes;
