import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Export = asyncComponent(() =>
  import(/* webpackChunkName: "Export" */ './export/containers/Form')
);

const Import = asyncComponent(() =>
  import(/* webpackChunkName: "Export" */ './import/containers/Form')
);

const exportForm = ({ location }) => {
  const queryParams = queryString.parse(location.search);
  return <Export contentType={queryParams.type} />;
};

const importForm = ({ location }) => {
  const queryParams = queryString.parse(location.search);
  return <Import contentType={queryParams.type} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/settings/export"
        exact={true}
        path="/settings/export"
        component={exportForm}
      />
      <Route
        key="/settings/import"
        exact={true}
        path="/settings/import"
        component={importForm}
      />
    </React.Fragment>
  );
};

export default routes;
