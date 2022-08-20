import { Wrapper } from '@erxes/ui/src/layout';
import React from 'react';
import CampaignList from '../containers/CampaignList';
import FilterCampaign from './FilterCampaign';
import { PaddingTop } from '../../../styles';

function Sidebar({
  loadingMainQuery,
  history,
  queryParams
}: {
  loadingMainQuery: boolean;
  history: any;
  queryParams: any;
}) {
  return (
    <Wrapper.Sidebar>
      <PaddingTop>
        <CampaignList queryParams={queryParams} history={history} />
        <FilterCampaign queryParams={queryParams} history={history} />
      </PaddingTop>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
