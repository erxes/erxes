import queryString from 'query-string';
import React from 'react';
import Settings from './configs/general/containers/Settings';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const VoucherCampaigns = asyncComponent(() =>
  import(
    /* webpackChunkName: "KnowledgeBase" */ './configs/voucherCampaign/containers/List'
  )
);

const LotteryCampaigns = asyncComponent(() =>
  import(
    /* webpackChunkName: "KnowledgeBase" */ './configs/lotteryCampaign/containers/List'
  )
);

const SpinCampaigns = asyncComponent(() =>
  import(
    /* webpackChunkName: "KnowledgeBase" */ './configs/spinCampaign/containers/List'
  )
);

const DonateCampaigns = asyncComponent(() =>
  import(
    /* webpackChunkName: "KnowledgeBase" */ './configs/donateCampaign/containers/List'
  )
);

const Vouchers = asyncComponent(() =>
  import(
    /* webpackChunkName: "KnowledgeBase" */ './loyalties/vouchers/containers/List'
  )
);

const Lotteries = asyncComponent(() =>
  import(
    /* webpackChunkName: "KnowledgeBase" */ './loyalties/lotteries/containers/List'
  )
);

const Spins = asyncComponent(() =>
  import(
    /* webpackChunkName: "KnowledgeBase" */ './loyalties/spins/containers/List'
  )
);

const Donates = asyncComponent(() =>
  import(
    /* webpackChunkName: "KnowledgeBase" */ './loyalties/donates/containers/List'
  )
);

const ScoreLogs = asyncComponent(() =>
  import(
    /* webpackChunkName: "KnowledgeBase" */ './loyalties/scorelogs/containers/List'
  )
);

const Award = asyncComponent(() =>
  import(
    /* webpackChunkName: "KnowledgeBase" */ './loyalties/lotteries/containers/Award'
  )
);
const voucherCampaignList = ({ location, history }) => {
  return (
    <VoucherCampaigns
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const lotteryCampaignList = ({ location, history }) => {
  return (
    <LotteryCampaigns
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const spinCampaignList = ({ location, history }) => {
  return (
    <SpinCampaigns
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const donateCampaignList = ({ location, history }) => {
  return (
    <DonateCampaigns
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const vouchers = ({ location, history }) => {
  return (
    <Vouchers
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const lotteries = ({ location, history }) => {
  return (
    <Lotteries
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const spins = ({ location, history }) => {
  return (
    <Spins queryParams={queryString.parse(location.search)} history={history} />
  );
};

const donates = ({ location, history }) => {
  return (
    <Donates
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const award = ({ location, history }) => {
  return (
    <Award queryParams={queryString.parse(location.search)} history={history} />
  );
};

const scorelogs = ({ history, location }) => {
  return (
    <ScoreLogs
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <>
      <Route
        path="/erxes-plugin-loyalty/settings/general"
        component={Settings}
      />

      <Route
        path="/erxes-plugin-loyalty/settings/voucher"
        component={voucherCampaignList}
      />

      <Route
        path="/erxes-plugin-loyalty/settings/lottery"
        component={lotteryCampaignList}
      />

      <Route
        path="/erxes-plugin-loyalty/settings/spin"
        component={spinCampaignList}
      />

      <Route
        path="/erxes-plugin-loyalty/settings/donate"
        component={donateCampaignList}
      />

      <Route path="/lotteryAward" component={award} />

      <Route path="/vouchers" component={vouchers} />

      <Route path="/lotteries" component={lotteries} />

      <Route path="/spins" component={spins} />

      <Route path="/donates" component={donates} />
      <Route path="/score" component={scorelogs} />
    </>
  );
};

export default routes;
