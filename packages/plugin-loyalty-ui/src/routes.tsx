import queryString from "query-string";
import React from "react";
import LoyaltySectionContainer from "./loyalties/containers/LoyaltySection";
import Settings from "./configs/general/containers/Settings";
import VoucherCompaigns from "./configs/voucherCompaign/containers/List";
import Vouchers from "./loyalties/vouchers/containers/List";
import Lotteries from "./loyalties/lotteries/containers/List";
import Spins from "./loyalties/spins/containers/List";
import Donates from "./loyalties/donates/containers/List";
import DonateCompaigns from "./configs/donateCompaign/containers/List";
import LotteryCompaigns from "./configs/lotteryCompaign/containers/List";
import SpinCompaigns from "./configs/spinCompaign/containers/List";
import { __ } from "@erxes/ui/src/utils";
import SetVoucher from "./automations/containers/SetVoucher";
import { Route } from "react-router-dom";

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

const customerSection = (param) => {
  return (
    <LoyaltySectionContainer ownerId={param.customerId} ownerType="customer" />
  );
};
const companySection = (param) => {
  return (
    <LoyaltySectionContainer ownerId={param.companyId} ownerType="company" />
  );
};
const userSection = (param) => {
  return <LoyaltySectionContainer ownerId={param.userId} ownerType="user" />;
};

const routes = () => {
  return (
    <>
      <Route path="/erxes-plugin-loyalty/settings/general" component={Settings} />

      <Route path="/settings/voucher" component={voucherCompaignList} />

      <Route path="/settings/lottery" component={lotteryCompaignList} />

      <Route path="/settings/spin" component={spinCompaignList} />

      <Route path="/settings/donate" component={donateCompaignList} />

      <Route path="/vouchers" component={vouchers} />

      <Route path="/lotteries" component={lotteries} />

      <Route path="/spins" component={spins} />

      <Route path="/donates" component={donates} />
    </>
  );
};

export default routes;
