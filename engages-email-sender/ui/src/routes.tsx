import asyncComponent from 'erxes-ui/lib/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const MessageForm = asyncComponent(() =>
  import(
    /* webpackChunkName: "MessageForm - Engage" */ './containers/MessageForm'
  )
);

const MessageList = asyncComponent(() =>
  import(
    /* webpackChunkName: "MessageList - Engage" */ './containers/MessageList'
  )
);

const engageList = history => {
  return <MessageList history={history} />;
};

const createForm = ({ location }) => {
  const queryParams = queryString.parse(location.search);
  return <MessageForm kind={queryParams.kind} />;
};

const editForm = ({ match }) => {
  return <MessageForm messageId={match.params._id} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/campaigns"
        exact={true}
        path="/campaigns"
        component={engageList}
      />

      <Route
        key="/campaigns/create"
        exact={true}
        path="/campaigns/create"
        component={createForm}
      />

      <Route
        key="/campaigns/edit"
        exact={true}
        path="/campaigns/edit/:_id"
        component={editForm}
      />
    </React.Fragment>
  );
};

export default routes;
