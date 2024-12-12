import { Route, Routes, useLocation } from "react-router-dom";

import React from "react";
import Settings from "./configs/general/containers/Settings";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";

const ScoreCampaigns = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ScoreCampaigns" */ "./configs/scoreCampaign/containers/List"
    )
);

const VoucherCampaigns = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "KnowledgeBase" */ "./configs/voucherCampaign/containers/List"
    )
);

const LotteryCampaigns = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "KnowledgeBase" */ "./configs/lotteryCampaign/containers/List"
    )
);

const SpinCampaigns = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "KnowledgeBase" */ "./configs/spinCampaign/containers/List"
    )
);

const DonateCampaigns = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "KnowledgeBase" */ "./configs/donateCampaign/containers/List"
    )
);

const AssignmentCampaigns = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "KnowledgeBase" */ "./configs/assignmentCampaign/containers/List"
    )
);

const AssignmentCampaignsCreate = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "KnowledgeBase" */ "./configs/assignmentCampaign/containers/CreateForm"
    )
);

const AssignmentCampaignsEdit = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "KnowledgeBase" */ "./configs/assignmentCampaign/containers/EditForm"
    )
);

const Vouchers = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "KnowledgeBase" */ "./loyalties/vouchers/containers/List"
    )
);

const Lotteries = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "KnowledgeBase" */ "./loyalties/lotteries/containers/List"
    )
);

const Spins = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "KnowledgeBase" */ "./loyalties/spins/containers/List"
    )
);

const Donates = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "KnowledgeBase" */ "./loyalties/donates/containers/List"
    )
);

const ScoreLogs = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "KnowledgeBase" */ "./loyalties/scorelogs/containers/List"
    )
);

const Award = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "KnowledgeBase" */ "./loyalties/lotteries/containers/Award"
    )
);

const Assignments = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "KnowledgeBase" */ "./loyalties/assignments/containers/List"
    )
);

const ScoreCampaignList = () => {
  const location = useLocation();

  return <ScoreCampaigns queryParams={queryString.parse(location.search)} />;
};

const VoucherCampaignList = () => {
  const location = useLocation();

  return <VoucherCampaigns queryParams={queryString.parse(location.search)} />;
};

const LotteryCampaignList = () => {
  const location = useLocation();

  return <LotteryCampaigns queryParams={queryString.parse(location.search)} />;
};

const SpinCampaignList = () => {
  const location = useLocation();

  return <SpinCampaigns queryParams={queryString.parse(location.search)} />;
};

const DonateCampaignList = () => {
  const location = useLocation();

  return <DonateCampaigns queryParams={queryString.parse(location.search)} />;
};

const AssignmentCampaignList = () => {
  const location = useLocation();

  return (
    <AssignmentCampaigns queryParams={queryString.parse(location.search)} />
  );
};

const AssignmentCampaignCreate = () => {
  const location = useLocation();

  return (
    <AssignmentCampaignsCreate
      queryParams={queryString.parse(location.search)}
    />
  );
};

const AssignmentCampaignEdit = () => {
  const location = useLocation();

  return (
    <AssignmentCampaignsEdit queryParams={queryString.parse(location.search)} />
  );
};

const VouchersComponent = () => {
  const location = useLocation();

  return <Vouchers queryParams={queryString.parse(location.search)} />;
};

const LotteriesComponent = () => {
  const location = useLocation();

  return <Lotteries queryParams={queryString.parse(location.search)} />;
};

const SpinsComponent = () => {
  const location = useLocation();

  return <Spins queryParams={queryString.parse(location.search)} />;
};

const DonatesComponent = () => {
  const location = useLocation();

  return <Donates queryParams={queryString.parse(location.search)} />;
};

const AwardComponent = () => {
  const location = useLocation();

  return <Award queryParams={queryString.parse(location.search)} />;
};

const Scorelogs = () => {
  const location = useLocation();

  return <ScoreLogs queryParams={queryString.parse(location.search)} />;
};

const AssignmentsComponent = () => {
  const location = useLocation();

  return <Assignments queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        path="/erxes-plugin-loyalty/settings/general"
        element={<Settings />}
      />

      <Route
        path="/erxes-plugin-loyalty/settings/score"
        element={<ScoreCampaignList />}
      />

      <Route
        path="/erxes-plugin-loyalty/settings/voucher"
        element={<VoucherCampaignList />}
      />

      <Route
        path="/erxes-plugin-loyalty/settings/lottery"
        element={<LotteryCampaignList />}
      />

      <Route
        path="/erxes-plugin-loyalty/settings/spin"
        element={<SpinCampaignList />}
      />

      <Route
        path="/erxes-plugin-loyalty/settings/donate"
        element={<DonateCampaignList />}
      />

      <Route
        path="/erxes-plugin-loyalty/settings/assignment"
        element={<AssignmentCampaignList />}
      />

      <Route
        path="/erxes-plugin-loyalty/settings/assignment/create"
        element={<AssignmentCampaignCreate />}
      />

      <Route
        path="/erxes-plugin-loyalty/settings/assignment/edit"
        element={<AssignmentCampaignEdit />}
      />

      <Route path="/lotteryAward" element={<AwardComponent />} />

      <Route path="/vouchers" element={<VouchersComponent />} />

      <Route path="/lotteries" element={<LotteriesComponent />} />

      <Route path="/spins" element={<SpinsComponent />} />

      <Route path="/donates" element={<DonatesComponent />} />

      <Route path="/score" element={<Scorelogs />} />

      <Route path="/assignments" element={<AssignmentsComponent />} />
    </Routes>
  );
};

export default routes;
