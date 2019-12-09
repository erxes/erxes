// import asyncComponent from 'modules/common/components/AsyncComponent';
// import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

// const MessageForm = asyncComponent(() =>
//   import(/* webpackChunkName: "MessageForm - Engage" */ './containers/MessageForm')
// );

// const MessageList = asyncComponent(() =>
//   import(/* webpackChunkName: "AutomationList" */ './containers/AutomationList')
// );

// const EmailStatistics = asyncComponent(() =>
//   import(/* webpackChunkName: "EmailStatistics - Engage" */ './containers/EmailStatistics')
// );

// const createForm = ({ location }) => {
//   const queryParams = queryString.parse(location.search);
//   return <MessageForm kind={queryParams.kind} />;
// };

// const editForm = ({ match }) => {
//   return <MessageForm messageId={match.params._id} />;
// };

// const statistic = ({ match }) => {
//   return <EmailStatistics messageId={match.params._id} />;
// };

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/automation/home"
        exact={true}
        path="/automation"
        // component={MessageList}
      />
    </React.Fragment>
  );
};

export default routes;
