import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const SitesListContainer = asyncComponent(() =>
  import(
    /* webpackChunkName: "Websites - ListContainer" */ './containers/templates/List'
  )
);

const SiteForm = asyncComponent(() =>
  import(
    /* webpackChunkName: "SiteForm - WebBuilders" */ './containers/sites/SiteForm'
  )
);

const WebBuilderContainer = asyncComponent(() =>
  import(
    /* webpackChunkName: "PageForm - WebBuilderContainer" */ './containers/Webbuilder'
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
  const site = localStorage.getItem('webbuilderSiteId') || '';

  const { step } = match.params;

  return (
    <SitesListContainer
      step={step}
      selectedSite={site}
      queryParams={queryParams}
    />
  );
};

const webBuilderSitesEdit = ({ match, location }) => {
  const _id = match.params._id;
  const queryParams = queryString.parse(location.search);

  return <SiteForm _id={_id} queryParams={queryParams} />;
};

const routes = () => {
  return (
    <>
      <Route
        path="/webbuilder"
        exact={true}
        component={webBuilderSitesContainer}
      />

      <Route
        path="/webbuilder/sites/create"
        exact={true}
        component={webBuilderSitesCreate}
      />

      <Route
        path="/webbuilder/sites/edit/:_id"
        exact={true}
        component={webBuilderSitesEdit}
      />
    </>
  );
};

export default routes;
