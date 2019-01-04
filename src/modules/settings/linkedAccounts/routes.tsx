import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { List } from './containers';

const twitterCallback = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <List history={history} queryParams={queryParams} />;
};

const gmailCallback = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <List history={history} queryParams={queryParams} />;
};

const routes = () => (
  <React.Fragment>
    <Route
      key="/service/oauth/twitter_callback"
      path="/service/oauth/twitter_callback"
      component={twitterCallback}
    />
    <Route
      key="/service/oauth/gmail_callback"
      path="/service/oauth/gmail_callback"
      component={gmailCallback}
    />

    <Route path="/settings/linkedAccounts/" component={List} />
  </React.Fragment>
);

export default routes;
