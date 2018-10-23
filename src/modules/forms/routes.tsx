import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { CreateForm, EditForm, List } from './containers';

const routes = () => {
  const forms = ({ location }) => {
    const queryParams = queryString.parse(location.search);
    return <List queryParams={queryParams} />;
  };

  const createForm = ({ location }) => {
    const queryParams = queryString.parse(location.search);
    return <CreateForm queryParams={queryParams} />;
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

  return (
    <React.Fragment>
      <Route exact={true} key="/forms" path="/forms" component={forms} />

      <Route
        key="/forms/create"
        exact={true}
        path="/forms/create"
        component={createForm}
      />

      <Route
        key="/forms/edit/:contentTypeId?/:formId?"
        exact={true}
        path="/forms/edit/:contentTypeId/:formId"
        component={editForm}
      />
    </React.Fragment>
  );
};

export default routes;
