import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Skills = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings - SkillTypesList" */ './containers/Skills'
  )
);

const skills = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <Skills queryParams={queryParams} history={history} />;
};

const routes = () => (
  <Route exact={true} path="/settings/skills" component={skills} />
);

export default routes;
