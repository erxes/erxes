import queryString from "query-string";
import React from "react";
import Settings from "./configs/general/containers/Settings";
import { __ } from "@erxes/ui/src/utils";
import { Route } from "react-router-dom";
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const VoucherCompaigns = asyncComponent(() =>
  import(/* webpackChunkName: "KnowledgeBase" */ './configs/voucherCompaign/containers/List')
)

const LotteryCompaigns = asyncComponent(() =>
  import(/* webpackChunkName: "KnowledgeBase" */ './configs/lotteryCompaign/containers/List')
)

const SpinCompaigns = asyncComponent(() =>
  import(/* webpackChunkName: "KnowledgeBase" */ './configs/spinCompaign/containers/List')
)

const DonateCompaigns = asyncComponent(() =>
  import(/* webpackChunkName: "KnowledgeBase" */ './configs/donateCompaign/containers/List')
)

const Vouchers = asyncComponent(() =>
  import(/* webpackChunkName: "KnowledgeBase" */ './loyalties/vouchers/containers/List')
)

const Lotteries = asyncComponent(() =>
  import(/* webpackChunkName: "KnowledgeBase" */ './loyalties/lotteries/containers/List')
)

const Spins = asyncComponent(() =>
  import(/* webpackChunkName: "KnowledgeBase" */ './loyalties/spins/containers/List')
)

const Donates = asyncComponent(() =>
  import(/* webpackChunkName: "KnowledgeBase" */ './loyalties/donates/containers/List')
)

const voucherCompaignList = ({ location, history }) => {
  return (
    <VoucherCompaigns
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const lotteryCompaignList = ({ location, history }) => {
  return (
    <LotteryCompaigns
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const spinCompaignList = ({ location, history }) => {
  return (
    <SpinCompaigns
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const donateCompaignList = ({ location, history }) => {
  return (
    <DonateCompaigns
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

const routes = () => {
  return (
    <>
      <Route path="/erxes-plugin-loyalty/settings/general" component={Settings} />

      <Route path="/erxes-plugin-loyalty/settings/voucher" component={voucherCompaignList} />

      <Route path="/erxes-plugin-loyalty/settings/lottery" component={lotteryCompaignList} />

      <Route path="/erxes-plugin-loyalty/settings/spin" component={spinCompaignList} />

      <Route path="/erxes-plugin-loyalty/settings/donate" component={donateCompaignList} />

      <Route path="/vouchers" component={vouchers} />

      <Route path="/lotteries" component={lotteries} />

      <Route path="/spins" component={spins} />

      <Route path="/donates" component={donates} />
    </>
  );
};

export default routes;
