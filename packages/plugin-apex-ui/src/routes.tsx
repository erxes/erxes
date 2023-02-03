import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings - List apexreport" */ './containers/List'
  )
);

const Form = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings - Form apexreport" */ './containers/Form'
  )
);

const StoryList = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings - StoryList" */ './containers/StoryList'
  )
);

const StoryForm = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings - StoryForm" */ './containers/StoryForm'
  )
);

const apexreports = ({ location, history }) => {
  return (
    <List queryParams={queryString.parse(location.search)} history={history} />
  );
};

const apexreportsCreate = ({ history }) => {
  return <Form history={history} />;
};

const apexreportsEdit = ({ history, match }) => {
  const _id = match.params._id;
  return <Form history={history} _id={_id} />;
};

const apexstories = ({ location, history }) => {
  return (
    <StoryList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const apexstoriesCreate = ({ history }) => {
  return <StoryForm history={history} />;
};

const apexstoriesEdit = ({ history, match }) => {
  const _id = match.params._id;
  return <StoryForm history={history} _id={_id} />;
};

const routes = () => (
  <>
    <Route path="/settings/apexreports/" exact={true} component={apexreports} />

    <Route
      path="/settings/apexreports/create"
      exact={true}
      component={apexreportsCreate}
    />

    <Route
      path="/settings/apexreports/edit/:_id"
      exact={true}
      component={apexreportsEdit}
    />

    <Route path="/settings/apexstories/" exact={true} component={apexstories} />

    <Route
      path="/settings/apexstories/create"
      exact={true}
      component={apexstoriesCreate}
    />

    <Route
      path="/settings/apexstories/edit/:_id"
      exact={true}
      component={apexstoriesEdit}
    />
  </>
);

export default routes;
