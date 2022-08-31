import { Wrapper } from '@erxes/ui/src/layout';
import React from 'react';
import CampaignList from '../containers/CampaignList';
import FilterCampaign from './FilterCampaign';
import { PaddingTop } from '../../../styles';

function Sidebar({
  loadingMainQuery,
  history,
  queryParams,
  isAward
}: {
  loadingMainQuery: boolean;
  history: any;
  queryParams: any;
  isAward: boolean;
}) {
  return (
    <Wrapper.Sidebar hasBorder>
      <PaddingTop>
        <CampaignList queryParams={queryParams} history={history} />
        {isAward && (
          <FilterCampaign queryParams={queryParams} history={history} />
        )}
      </PaddingTop>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
