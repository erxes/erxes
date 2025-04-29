import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import CampaignList from '../containers/CampaignList';
import FilterCampaign from './FilterCampaign';

type Props = {
  queryParams: any;
};

function Sidebar({ queryParams }: Props) {
  return (
    <Wrapper.Sidebar hasBorder>
      <CampaignList queryParams={queryParams} />
      <FilterCampaign queryParams={queryParams} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
