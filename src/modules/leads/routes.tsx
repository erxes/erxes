import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const CreateForm = asyncComponent(() =>
  import(/* webpackChunkName: "CreateForm" */ './containers/CreateForm')
);

const EditForm = asyncComponent(() =>
  import(/* webpackChunkName: "EditForm" */ './containers/EditForm')
);

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Form" */ './containers/List')
);

const forms = ({ location }) => {
  const queryParams = queryString.parse(location.search);
  return <List queryParams={queryParams} />;
};

const createForm = () => {
  return <CreateForm />;
};

const editForm = ({ match, location }) => {
  const { contentTypeId, formId } = match.params;
  const queryParams = queryString.parse(location.search);

  return (
    <EditForm
      queryParams={queryParams}
      contentTypeId={contentTypeId}
      formId={formId}
    />
  );
};

const routes = () => {
  return (
    <React.Fragment>
      <Route exact={true} key="/leads" path="/leads" component={forms} />

      <Route
        key="/leads/create"
        exact={true}
        path="/leads/create"
        component={createForm}
      />

      <Route
        key="/leads/edit/:contentTypeId?/:formId?"
        exact={true}
        path="/leads/edit/:contentTypeId/:formId"
        component={editForm}
      />
    </React.Fragment>
  );
};

export default routes;
