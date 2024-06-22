import { Wrapper } from '@erxes/ui/src/layout';
import React from 'react';
import CampaignList from '../containers/CampaignList';
import FilterCampaign from './FilterCampaign';
import { PaddingTop } from '../../../styles';

function Sidebar({
  loadingMainQuery,
  queryParams,
  isAward
}: {
  loadingMainQuery: boolean;
  queryParams: any;
  isAward: boolean;
}) {
  return (
    <Wrapper.Sidebar hasBorder>
      <PaddingTop>
        <CampaignList queryParams={queryParams}  />
        {isAward && (
          <FilterCampaign queryParams={queryParams}  />
        )}
      </PaddingTop>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
