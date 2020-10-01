import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

// const WebhookDetail = asyncComponent(() =>
//   import(/* webpackChunkName: "Settings - WebhookDetail" */ './containers/WebhookDetail')
// );

const WebhookList = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - WebhookList" */ './containers/WebhookList')
);

const webhook = ({ history, location }) => {
  const queryParams = queryString.parse(location.search);
  return <WebhookList queryParams={queryParams} history={history} />;
};

// const webhookDetail = ({ match, location }) => {
//   const queryParams = queryString.parse(location.search);
//   const id = match.params.id;

//   return <WebhookDetail _id={id} queryParams={queryParams} />;
// };

// const routes = () => (
//   <React.Fragment>
//     <Route
//       path="/settings/webhooks/"
//       exact={true}
//       key="/settings/webhooks/"
//       component={webhook}
//     />

//     {/* <Route
//       key="/settings/webhook/details/:id"
//       exact={true}
//       path="/settings/webhook/details/:id"
//       component={webhookDetail}
//     /> */}
//   </React.Fragment>
// );

const routes = () => (
  <Route
    exact={true}
    path="/settings/webhooks/"
    component={webhook}
  />
);

export default routes;
