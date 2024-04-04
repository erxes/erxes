import { Route, Switch } from 'react-router-dom';

import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const SitesListContainer = asyncComponent(() =>
  import(
    /* webpackChunkName: "Websites - ListContainer" */ './containers/templates/List'
  )
);

const SiteForm = asyncComponent(() =>
  import(
    /* webpackChunkName: "SiteForm - XBuilders" */ './containers/sites/SiteForm'
  )
);

const WebBuilderContainer = asyncComponent(() =>
  import(
    /* webpackChunkName: "PageForm - XBuilderContainer" */ './containers/Webbuilder'
  )
);

const webBuilderSitesContainer = history => {
  const { location, match } = history;

  const queryParams = queryString.parse(location.search);

  const { step } = match.params;

  return <WebBuilderContainer step={step} queryParams={queryParams} />;
};

const webBuilderSitesCreate = history => {
  const { location, match } = history;

  const queryParams = queryString.parse(location.search);

  const { step } = match.params;

  return <SitesListContainer step={step} queryParams={queryParams} />;
};

const webBuilderSitesEdit = ({ match, location }) => {
  const _id = match.params._id;
  const queryParams = queryString.parse(location.search);

  return <SiteForm _id={_id} queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Switch>
      <Route
        path="/xbuilder"
        exact={true}
        component={webBuilderSitesContainer}
      />

      <Route
        path="/xbuilder/sites/create"
        exact={true}
        component={webBuilderSitesCreate}
      />

      <Route
        path="/xbuilder/sites/edit/:_id"
        exact={true}
        component={webBuilderSitesEdit}
      />
    </Switch>
  );
};

export default routes;
