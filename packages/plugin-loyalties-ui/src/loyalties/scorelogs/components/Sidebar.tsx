import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import CampaignList from '../containers/CampaignList';
import FilterCampaign from './FilterCampaign';

function Sidebar({
  loadingMainQuery,
  queryParams,
  refetch,
  toggleSidebar,
}: {
  loadingMainQuery: boolean;
  queryParams: any;
  refetch: (variable: any) => void;
  toggleSidebar: boolean;
}) {
  if (!toggleSidebar) {
    return <></>;
  }

  return (
    <Wrapper.Sidebar hasBorder>
      <CampaignList queryParams={queryParams} />
      <FilterCampaign queryParams={queryParams} refetch={refetch} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
