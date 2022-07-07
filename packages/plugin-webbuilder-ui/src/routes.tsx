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
    </>
  );
};

export default routes;
