import queryString from 'query-string';
import Settings from './containers/Settings';
import React from 'react';
import { Route } from 'react-router-dom';

import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const GeneralSettings = asyncComponent(() =>
  import(/* webpackChunkName: "KnowledgeBase" */ './components/GeneralSettings')
);

const StageSettings = asyncComponent(() =>
  import(/* webpackChunkName: "KnowledgeBase" */ './components/StageSettings')
);

const ReturnStageSettings = asyncComponent(() =>
  import(
    /* webpackChunkName: "KnowledgeBase" */ './components/ReturnStageSettings'
  )
);

const PutResponses = asyncComponent(() =>
  import(/* webpackChunkName: "KnowledgeBase" */ './containers/PutResponses')
);

const GeneralSetting = () => {
  return <Settings component={GeneralSettings} />;
};

const StageSetting = () => {
  return <Settings component={StageSettings} />;
};

const ReturnStageSetting = () => {
  return <Settings component={ReturnStageSettings} />;
};

const PutResponsesComponent = ({ location, history }) => {
  return (
    <PutResponses
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        path="/erxes-plugin-ebarimt/settings/general"
        component={GeneralSetting}
      />
      <Route
        path="/erxes-plugin-ebarimt/settings/stage"
        component={StageSetting}
      />
      <Route
        path="/erxes-plugin-ebarimt/settings/return-stage"
        component={ReturnStageSetting}
      />
      <Route path="/put-responses" component={PutResponsesComponent} />
    </React.Fragment>
  );
  // response: returnResponse
};

export default routes;
