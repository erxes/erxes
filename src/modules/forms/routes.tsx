import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { CreateForm, EditForm, List } from './containers';

const routes = () => (
  <React.Fragment>
    <Route
      exact
      key="/forms"
      path="/forms"
      component={({ location }) => {
        const queryParams = queryString.parse(location.search);
        return <List queryParams={queryParams} />;
      }}
    />

    <Route
      key="/forms/create"
      exact
      path="/forms/create"
      component={({ location }) => {
        const queryParams = queryString.parse(location.search);
        return <CreateForm queryParams={queryParams} />;
      }}
    />

    <Route
      key="/forms/edit/:contentTypeId?/:formId?"
      exact
      path="/forms/edit/:contentTypeId/:formId"
      component={({ match, location }) => {
        const { contentTypeId, formId } = match.params;
        const queryParams = queryString.parse(location.search);

        return (
          <EditForm
            queryParams={queryParams}
            contentTypeId={contentTypeId}
            formId={formId}
          />
        );
      }}
    />
  </React.Fragment>
);

export default routes;
