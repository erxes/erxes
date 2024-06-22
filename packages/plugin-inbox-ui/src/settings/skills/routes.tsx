import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const Skills = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - SkillTypesList" */ './containers/Skills'
    ),
);

const SkillsComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = queryString.parse(location.search);

  return <Skills queryParams={queryParams} history={navigate} />;
};

const routes = () => (
  <Routes>
    <Route path="/settings/skills" element={<SkillsComponent />} />
  </Routes>
);

export default routes;
