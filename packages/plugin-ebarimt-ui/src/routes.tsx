import queryString from 'query-string';
import Settings from './containers/Settings';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

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

const PutResponsesByDate = asyncComponent(() =>
  import(
    /* webpackChunkName: "KnowledgeBase" */ './containers/PutResponsesByDate'
  )
);

const PutResponsesDuplicated = asyncComponent(() =>
  import(
    /* webpackChunkName: "PutResponsesDuplicated" */ './containers/PutResponsesDuplicated'
  )
);

const ProductRule = asyncComponent(() =>
  import(
    /* webpackChunkName: "ProductRule" */ './containers/ProductRuleList'
  )
);

const GeneralSetting = () => {
  return <Settings component={GeneralSettings} configCode="EBARIMT" />;
};

const StageSetting = () => {
  return <Settings component={StageSettings} configCode="stageInEbarimt" />;
};

const ReturnStageSetting = () => {
  return (
    <Settings
      component={ReturnStageSettings}
      configCode="returnStageInEbarimt"
    />
  );
};

const PutResponsesComponent = () => {
  const location = useLocation();
  
  return (
    <PutResponses
      queryParams={queryString.parse(location.search)}
    />
  );
};

const PutResponsesByDateComponent = () => {
  const location = useLocation();
  
  return (
    <PutResponsesByDate
      queryParams={queryString.parse(location.search)}
    />
  );
};

const PutResponsesDuplicatedComponent = () => {
  const location = useLocation();
  
  return (
    <PutResponsesDuplicated
      queryParams={queryString.parse(location.search)}
    />
  );
};

const ProductRuleComponent = () => {
  const location = useLocation();
  
  return (
    <ProductRule
      queryParams={queryString.parse(location.search)}
    />
  );
};

const routes = () => {
  return (
    <Routes>
      <Route
        path="/erxes-plugin-ebarimt/settings/general"
        element={<GeneralSetting/>}
      />
      <Route
        path="/erxes-plugin-ebarimt/settings/stage"
        element={<StageSetting/>}
      />
      <Route
        path="/erxes-plugin-ebarimt/settings/return-stage"
        element={<ReturnStageSetting/>}
      />
      <Route path="/put-responses" element={<PutResponsesComponent/>} />
      <Route
        path="/put-responses-by-date"
        element={<PutResponsesByDateComponent/>}
      />
      <Route
        path="/put-responses-duplicated"
        element={<PutResponsesDuplicatedComponent/>}
      />
      <Route
        path="/erxes-plugin-ebarimt/settings/product-rule"
        element={<ProductRuleComponent/>}
      />
    </Routes>
  );
  // response: returnResponse
};

export default routes;
