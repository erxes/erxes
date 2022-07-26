import queryString from 'query-string';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const WebBuilder = asyncComponent(() =>
  import(
    /* webpackChunkName: "webbuilderHome - Webbuilders" */ './containers/WebBuilder'
  )
);

const PageForm = asyncComponent(() =>
  import(
    /* webpackChunkName: "PageForm - Webbuilders" */ './containers/pages/PageForm'
  )
);

const EntryForm = asyncComponent(() =>
  import(
    /* webpackChunkName: "EntryForm - Webbuilders" */ './containers/entries/EntryForm'
  )
);

const CreateContentType = asyncComponent(() =>
  import(
    /* webpackChunkName: "CreateContentType -- Webbuilders" */ './containers/contentTypes/CreateContentType'
  )
);

const EditContentType = asyncComponent(() =>
  import(
    /* webpackChunkName: "EditContentType -- Webbuilders" */ './containers/contentTypes/EditContentType'
  )
);

const webBuilders = history => {
  const { location, match } = history;

  const queryParams = queryString.parse(location.search);

  const step = match.params.step;

  return <WebBuilder step={step} queryParams={queryParams} history={history} />;
};

const createContentType = () => {
  return <CreateContentType />;
};

const editContentType = ({ match, location }) => {
  const { id } = match.params;

  const queryParams = queryString.parse(location.search);

  return <EditContentType contentTypeId={id} queryParams={queryParams} />;
};

const pageEdit = ({ match }) => {
  const _id = match.params._id;

  return <PageForm _id={_id} />;
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
        path="/webbuilder/pages/create"
        exact={true}
        component={PageForm}
      />
      <Route
        key="/webbuilder/pages/edit/:_id"
        path="/webbuilder/pages/edit/:_id"
        exact={true}
        component={pageEdit}
      />

      <Route
        path="/webbuilder/contenttypes/create"
        exact={true}
        component={createContentType}
      />

      <Route
        path="/webbuilder/contenttypes/edit/:id"
        exact={true}
        component={editContentType}
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
