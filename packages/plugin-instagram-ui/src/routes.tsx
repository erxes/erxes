import React from 'react';
import { Route, Routes } from 'react-router-dom';
import queryString from 'query-string';

import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { Authorization } from './containers/Authorization';
import { useLocation, useNavigate, useParams } from "react-router-dom";

const CreateInstagram = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings CreateInstagram" */ './containers/Form'
    )
);
const MessengerBotForm = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings Messenger Bots" */ "./automations/bots/containers/Form"
    )
);
const CreateInstagramComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = queryString.parse(location.search);

  const callBack = () => {
    navigate('/settings/integrations/');
  };

  return (
    <CreateInstagram
      callBack={callBack}
      kind={queryParams.kind}
    />
  );
};
const IGMessengerBot = () => {
  const location = useLocation();

  const { id } = useParams();
  const queryParams = queryString.parse(location.search);

  return <MessengerBotForm _id={id} queryParams={queryParams} />;
};
const Auth = () => {
  const location = useLocation();
  return <Authorization queryParams={queryString.parse(location.search)} />;
};

const routes = () => (
  <Routes>
    <Route
      key='/settings/integrations/createInstagram'
      path='/settings/integrations/createInstagram'
      element={<CreateInstagramComponent />}
    />

    <Route
      key='/settings/ig-authorization'
      path='/settings/ig-authorization'
      element={<Auth />}
    />
    <Route
      key="/settings/instagram-messenger-bot"
      path="/settings/instagram-messenger-bot/edit/:id"
      element={<IGMessengerBot />}
    />

    <Route
      key="/settings/instagram-messenger-bot"
      path="/settings/instagram-messenger-bot/create"
      element={<IGMessengerBot />}
    />
  </Routes>
);

export default routes;
