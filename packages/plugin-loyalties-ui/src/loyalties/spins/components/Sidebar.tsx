import { Wrapper } from '@erxes/ui/src/layout';
import React from 'react';
import CampaignList from '../containers/CampaignList';
import FilterCampaign from './FilterCampaign';
import { PaddingTop } from '../../../styles';

function Sidebar({
  loadingMainQuery,
  queryParams
}: {
  loadingMainQuery: boolean;
  queryParams: any;
}) {
  return (
    <Wrapper.Sidebar hasBorder>
      <PaddingTop>
        <CampaignList queryParams={queryParams}  />
        <FilterCampaign queryParams={queryParams}  />
      </PaddingTop>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
