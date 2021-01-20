import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const CreateLead = asyncComponent(() =>
  import(/* webpackChunkName: "CreateLead" */ './containers/CreateLead')
);

const EditLead = asyncComponent(() =>
  import(/* webpackChunkName: "EditLead" */ './containers/EditLead')
);

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Form" */ './containers/List')
);

const forms = history => {
  const { location } = history;

  const queryParams = queryString.parse(location.search);

  return <List queryParams={queryParams} history={history} />;
};

const createLead = () => {
  return <CreateLead />;
};

const editLead = ({ match, location }) => {
  const { contentTypeId, formId } = match.params;
  const queryParams = queryString.parse(location.search);

  return (
    <EditLead
      queryParams={queryParams}
      formId={formId}
      contentTypeId={contentTypeId}
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
        component={createLead}
      />

      <Route
        key="/leads/edit/:contentTypeId?/:formId?"
        exact={true}
        path="/leads/edit/:contentTypeId/:formId?"
        component={editLead}
      />
    </React.Fragment>
  );
};

export default routes;
