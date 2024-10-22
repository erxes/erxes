import React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';

import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { Authorization } from './containers/Authorization';

const CreateWhatsapp = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings CreateWhatsapp" */ './containers/Form'
    )
);

const CreateWhatsappComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = queryString.parse(location.search);

  const callBack = () => {
    navigate('/settings/integrations/');
  };

  return (
    <CreateWhatsapp
      callBack={callBack}
      kind={queryParams.kind}
    />
  );
};

const Auth = () => {
  const location = useLocation();
  return <Authorization queryParams={queryString.parse(location.search)} />;
};

const routes = () => (
  <Routes>
    <Route
      key='/settings/integrations/createWhatsapp'
      path='/settings/integrations/createWhatsapp'
      element={<CreateWhatsappComponent />}
    />

    <Route
      key='/settings/ig-authorization'
      path='/settings/ig-authorization'
      element={<Auth />}
    />
  </Routes>
);

export default routes;
