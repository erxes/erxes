import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

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

const dictionary = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { parentId } = queryParams;
  return <Dictionary parentId={parentId} history={history} />;
};

const zms = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { id } = queryParams;
  return <Zms id={id} history={history} />;
};

const mainSettings = () => {
  return <Settings components={MainConfig}></Settings>;
};

const routes = () => {
  return (
    <>
      <Route path="/plugin-zms/dictionary" component={dictionary} />
      <Route path="/plugin-zms/zms" component={zms} />
      <Route path="/plugin-zms/settings" component={mainSettings} />
    </>
  );
};

export default routes;
