// import QpaySection from './components/common/QpaySection'
import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const Settings = asyncComponent(() =>
  import(/* webpackChunkName: "KnowledgeBase" */ './containers/Settings')
);

const SPSettings = asyncComponent(() =>
  import(/* webpackChunkName: "KnowledgeBase" */ './containers/SPSettings')
);

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/erxes-plugin-qpay/settings/" component={Settings} />
      <Route
        path="/erxes-plugin-qpay/settings_socialPay"
        component={SPSettings}
      />
    </React.Fragment>
  );
  // ,customerRightSidebarSection: {
  //   section: QpaySection,
  // },
};

export default routes;
