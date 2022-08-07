import Settings from './containers/Settings';
import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

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

const PipelineSettings = asyncComponent(() =>
  import(
    /* webpackChunkName: "KnowledgeBase" */ './components/PipelineSettings'
  )
);

const CheckSyncedDeals = asyncComponent(() =>
  import(
    /* webpackChunkName: "KnowledgeBase" */ './containers/CheckSyncedDeals'
  )
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

const PipelineSetting = () => {
  return <Settings component={PipelineSettings} />;
};
const checkSyncedDealList = ({ location, history }) => {
  return (
    <CheckSyncedDeals
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/erxes-plugin-sync-erkhet/settings/general"
        exact={true}
        path="/erxes-plugin-sync-erkhet/settings/general"
        component={GeneralSetting}
      />

      <Route
        key="/erxes-plugin-sync-erkhet/settings/stage"
        exact={true}
        path="/erxes-plugin-sync-erkhet/settings/stage"
        component={StageSetting}
      />

      <Route
        key="/erxes-plugin-sync-erkhet/settings/return-stage"
        exact={true}
        path="/erxes-plugin-sync-erkhet/settings/return-stage"
        component={ReturnStageSetting}
      />

      <Route
        key="/erxes-plugin-sync-erkhet/settings/pipeline"
        exact={true}
        path="/erxes-plugin-sync-erkhet/settings/pipeline"
        component={PipelineSetting}
      />

      <Route
        key="/check-synced-deals"
        exact={true}
        path="/check-synced-deals"
        component={checkSyncedDealList}
      />
    </React.Fragment>
  );
};

export default routes;
