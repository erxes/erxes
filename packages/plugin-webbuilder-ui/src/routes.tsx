import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const WebBuilder = asyncComponent(() =>
  import(
    /* webpackChunkName: "webbuilderHome - Webbuilders" */ './components/WebBuilder'
  )
);

const WebBuilderContainer = asyncComponent(() =>
  import(
    /* webpackChunkName: "PageForm - Webbuilders" */ './containers/WebBuilder'
  )
);

const SitesListContainer = asyncComponent(() =>
  import(
    /* webpackChunkName: "Websites - ListContainer" */ './containers/templates/List'
  )
);

const PageForm = asyncComponent(() =>
  import(
    /* webpackChunkName: "PageForm - Webbuilders" */ './containers/pages/PageForm'
  )
);

const SiteForm = asyncComponent(() =>
  import(
    /* webpackChunkName: "SiteForm - Webbuilders" */ './containers/sites/SiteForm'
  )
);

const EntryForm = asyncComponent(() =>
  import(
    /* webpackChunkName: "EntryForm - Webbuilders" */ './containers/entries/EntryForm'
  )
);

const ContentTypeForm = asyncComponent(() =>
  import(
    /* webpackChunkName: "ContentType -- Webbuilders" */ './containers/contentTypes/ContentTypeForm'
  )
);

const webBuilders = history => {
  const { location, match } = history;

  const queryParams = queryString.parse(location.search);

  const { step } = match.params;

  return <WebBuilder step={step} queryParams={queryParams} />;
};

const webBuilderSitesContainer = history => {
  const { location, match } = history;

  const queryParams = queryString.parse(location.search);

  const { step } = match.params;

  return <WebBuilderContainer step={step} queryParams={queryParams} />;
};

const webBuilderTemplatesContainer = history => {
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

const typeEdit = ({ match }) => {
  const id = match.params.id;

  return <ContentTypeForm contentTypeId={id} />;
};

const siteEdit = ({ match }) => {
  const _id = match.params._id;

  return <SiteForm _id={_id} />;
};

const entryAdd = ({ match, location }) => {
  const { contentTypeId } = match.params;
  const queryParams = queryString.parse(location.search);

  return <EntryForm contentTypeId={contentTypeId} queryParams={queryParams} />;
};

const entryEdit = ({ match, location }) => {
  const { contentTypeId, _id } = match.params;

  const queryParams = queryString.parse(location.search);

  return (
    <EntryForm
      contentTypeId={contentTypeId}
      queryParams={queryParams}
      _id={_id}
    />
  );
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
        component={webBuilderTemplatesContainer}
      />

      <Route
        path="/webbuilder/sites/edit/:_id"
        exact={true}
        component={siteEdit}
      />

      <Route
        path="/webbuilder/pages/create"
        exact={true}
        component={PageForm}
      />

      <Route
        path="/webbuilder/contenttypes/create"
        exact={true}
        component={ContentTypeForm}
      />

      <Route
        path="/webbuilder/contenttypes/edit/:id"
        exact={true}
        component={typeEdit}
      />

      <Route
        path="/webbuilder/entries/create/:contentTypeId"
        exact={true}
        component={entryAdd}
      />
      <Route
        key="/webbuilder/entries/edit/:contentTypeId/:_id"
        path="/webbuilder/entries/edit/:contentTypeId/:_id"
        exact={true}
        component={entryEdit}
      />

      <Route path="/webbuilder/:step" exact={true} component={webBuilders} />
    </>
  );
};

export default routes;
