import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { Calendar as GoogleCalendar } from './containers/google';
import CreateMessenger from './containers/messenger/Create';
import EditMessenger from './containers/messenger/Edit';
import Store from './containers/Store';

const createMessenger = ({ location }) => {
  return <CreateMessenger queryParams={queryString.parse(location.search)} />;
};

const editMessenger = ({ match }) => {
  return <EditMessenger integrationId={match.params._id} />;
};

const googleCalendar = ({ history, location }) => {
  const queryParams = queryString.parse(location.search);

  return (
    <GoogleCalendar type="link" history={history} queryParams={queryParams} />
  );
};

const googleCalendarCallback = ({ history, location }) => {
  const queryParams = queryString.parse(location.search);

  return (
    <GoogleCalendar type="form" history={history} queryParams={queryParams} />
  );
};

const twitterCallback = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <Store history={history} queryParams={queryParams} />;
};

const gmailCallback = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <Store history={history} queryParams={queryParams} />;
};

const store = ({ location }) => (
  <Store queryParams={queryString.parse(location.search)} />
);

const routes = () => (
  <React.Fragment>
    <Route
      key="/settings/integrations/createMessenger"
      exact={true}
      path="/settings/integrations/createMessenger"
      component={createMessenger}
    />

    <Route
      key="/settings/integrations/editMessenger/:_id"
      exact={true}
      path="/settings/integrations/editMessenger/:_id"
      component={editMessenger}
    />

    <Route
      key="/settings/integrations/google-calendar"
      exact={true}
      path="/settings/integrations/google-calendar"
      component={googleCalendar}
    />

    <Route
      key="/service/oauth/google_calendar_callback"
      path="/service/oauth/google_calendar_callback"
      component={googleCalendarCallback}
    />

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

    <Route
      key="/settings/integrations"
      exact={true}
      path="/settings/integrations"
      component={store}
    />
  </React.Fragment>
);

export default routes;
