import { Route, Routes, useLocation, useParams } from 'react-router-dom';

import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const MessageForm = asyncComponent(() => {
  const comp = import(
    /* webpackChunkName: "MessageForm - Engage" */ './containers/MessageForm'
  );

  return comp;
});

const MessageList = asyncComponent(() => {
  const comp = import(
    /* webpackChunkName: "MessageList - Engage" */ './containers/MessageList'
  );

  return comp;
});

const EngageStats = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "EngageStats - Engage" */ './containers/EngageStats'
    )
);

const EngageConfigs = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Engage configs" */ '../settings/campaigns/components/EngageConfigs'
    )
);

const EngageList = () => {
  return <MessageList />;
};

const CreateForm = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <MessageForm kind={'manual'} />;
};

const EditForm = () => {
  const { _id } = useParams();

  return <MessageForm messageId={_id} />;
};

const Statistic = () => {
  const { _id } = useParams();

  return <EngageStats messageId={_id} />;
};

const routes = () => {
  return (
    <Routes>
      <Route key='/campaigns' path='/campaigns' element={<EngageList />} />

      <Route
        key='/campaigns/create'
        path='/campaigns/create'
        element={<CreateForm />}
      />

      <Route
        key='/campaigns/edit'
        path='/campaigns/edit/:_id'
        element={<EditForm />}
      />

      <Route
        key='/campaigns/show'
        path='/campaigns/show/:_id'
        element={<Statistic />}
      />

      <Route
        key='/settings/campaign-configs/'
        path='/settings/campaign-configs/'
        element={<EngageConfigs />}
      />
    </Routes>
  );
};

export default routes;
