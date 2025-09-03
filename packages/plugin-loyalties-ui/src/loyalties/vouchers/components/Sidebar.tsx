import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import React from "react";
import CampaignList from "../containers/CampaignList";
import FilterCampaign from "./FilterCampaign";

function Sidebar({
  loadingMainQuery,
  queryParams,
}: {
  loadingMainQuery: boolean;
  queryParams: any;
}) {
  return (
    <Wrapper.Sidebar hasBorder>
      <CampaignList queryParams={queryParams} />
      <FilterCampaign queryParams={queryParams} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
