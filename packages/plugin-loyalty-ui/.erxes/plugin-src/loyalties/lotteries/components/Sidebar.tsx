import { Wrapper } from '@erxes/ui/src/layout';
import React from 'react';
import CampaignList from '../containers/CampaignList';
import FilterCampaign from './FilterCampaign';

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
      <CampaignList queryParams={queryParams} history={history} />
      <FilterCampaign queryParams={queryParams} history={history}/>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
