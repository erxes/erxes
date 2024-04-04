import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
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
    <Wrapper.Sidebar hasBorder>
      <PaddingTop>
        <CampaignList queryParams={queryParams} history={history} />
        <FilterCampaign queryParams={queryParams} history={history} />
      </PaddingTop>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
