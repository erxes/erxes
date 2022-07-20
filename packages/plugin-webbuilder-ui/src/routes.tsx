import queryString from 'query-string';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const Pages = asyncComponent(() =>
  import(/* webpackChunkName: "Pages - Webbuilders" */ './containers/Pages')
);

const PageForm = asyncComponent(() =>
  import(
    /* webpackChunkName: "PageForm - Webbuilders" */ './containers/PageForm'
  )
);

const ContentTypesList = asyncComponent(() =>
  import(
    /* webpackChunkName: "ContentTypes - Webbuilders" */ './containers/contentTypes/List'
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

const EntriesList = asyncComponent(() =>
  import(
    /* webpackChunkName: "EntriesList -- Webbuilders" */ './containers/entries/List'
  )
);

const contentTypes = history => {
  const { location } = history;

  const queryParams = queryString.parse(location.search);

  return <ContentTypesList queryParams={queryParams} history={history} />;
};

const createContentType = () => {
  return <CreateContentType />;
};

const editContentType = ({ match, location }) => {
  const { id } = match.params;
  const queryParams = queryString.parse(location.search);

  return <EditContentType contentTypeId={id} queryParams={queryParams} />;
};

const entriesList = ({ location, history }) => {
  return (
    <EntriesList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const pageEdit = ({ match }) => {
  const _id = match.params._id;

  return <PageForm _id={_id} />;
};

const routes = () => {
  return (
    <>
      <Route path="/webbuilder/pages" exact={true} component={Pages} />
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
        path="/webbuilder/contenttypes"
        exact={true}
        component={contentTypes}
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

      <Route path="/webbuilder/entries" exact={true} component={entriesList} />
    </>
  );
};

export default routes;
