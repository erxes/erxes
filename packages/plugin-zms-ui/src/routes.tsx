import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

const Zms = asyncComponent(() =>
  import(/* webpackChunkName: "List - Zmss" */ './containers/zms/List')
);

const Dictionary = asyncComponent(() =>
  import(/* webpackChunkName: "List - Zmss" */ './containers/dictionary/List')
);

const Settings = asyncComponent(() =>
  import(/* webpackChunkName: "List - Zmss" */ './settings/containers/Settings')
);

const MainConfig = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Zmss" */ './settings/components/MainConfig'
  )
);

const DictionaryComponent = () => {
  const location= useLocation()
  const queryParams = queryString.parse(location.search);
  const { parentId } = queryParams;
  return <Dictionary parentId={parentId} />;
};

const ZmsComponent = () => {
  const location= useLocation()
  const queryParams = queryString.parse(location.search);
  const { id } = queryParams;
  return <Zms id={id} />;
};

const MainSettings = () => {
  return <Settings components={MainConfig}></Settings>;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/plugin-zms/dictionary" element={<DictionaryComponent/>} />
      <Route path="/plugin-zms/zms" element={<ZmsComponent/>} />
      <Route path="/plugin-zms/settings" element={<MainSettings/>} />
    </Routes>
  );
};

export default routes;
