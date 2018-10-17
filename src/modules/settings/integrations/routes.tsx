import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { Calendar as GoogleCalendar, Gmail } from './containers/google';
import CreateMessenger from './containers/messenger/Create';
import EditMessenger from './containers/messenger/Edit';
import Store from './containers/Store';
import Twitter from './containers/twitter/Form';

const store = ({ location }) => (
  <Store queryParams={queryString.parse(location.search)} />
);

const routes = () => (
  <React.Fragment>
    <Route
      key="/settings/integrations/createMessenger"
      exact={true}
      path="/settings/integrations/createMessenger"
      component={({ location }) => {
        return (
          <CreateMessenger queryParams={queryString.parse(location.search)} />
        );
      }}
    />

    <Route
      key="/settings/integrations/editMessenger/:_id"
      exact={true}
      path="/settings/integrations/editMessenger/:_id"
      component={({ match }) => {
        return <EditMessenger integrationId={match.params._id} />;
      }}
    />

    <Route
      key="/settings/integrations/twitter"
      exact={true}
      path="/settings/integrations/twitter"
      component={() => <Twitter type="link" />}
    />

    <Route
      key="/settings/integrations/google-calendar"
      exact={true}
      path="/settings/integrations/google-calendar"
      component={({ history, location }) => {
        const queryParams = queryString.parse(location.search);

        return (
          <GoogleCalendar
            type="link"
            history={history}
            queryParams={queryParams}
          />
        );
      }}
    />

    <Route
      key="/settings/integrations/gmail"
      exact={true}
      path="/settings/integrations/gmail"
      component={({ history, location }) => {
        const queryParams = queryString.parse(location.search);

        return (
          <Gmail type="link" history={history} queryParams={queryParams} />
        );
      }}
    />

    <Route
      key="/service/oauth/twitter_callback"
      path="/service/oauth/twitter_callback"
      component={({ history, location }) => {
        const queryParams = queryString.parse(location.search);

        return (
          <Twitter type="form" history={history} queryParams={queryParams} />
        );
      }}
    />

    <Route
      key="/service/oauth/google_callback"
      path="/service/oauth/google_callback"
      component={({ history, location }) => {
        const queryParams = queryString.parse(location.search);

        return (
          <GoogleCalendar
            type="form"
            history={history}
            queryParams={queryParams}
          />
        );
      }}
    />

    <Route
      key="/service/oauth/gmail_callback"
      path="/service/oauth/gmail_callback"
      component={({ history, location }) => {
        const queryParams = queryString.parse(location.search);

        return (
          <Gmail type="form" history={history} queryParams={queryParams} />
        );
      }}
    />

    <Route
      key="/settings/integrations"
      exact={true}
      path="/settings/integrations"
      component={store}
    />
  </React.Fragment>
);

export default routes;
