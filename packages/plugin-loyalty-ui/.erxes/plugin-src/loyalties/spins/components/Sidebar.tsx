import { Wrapper } from '@erxes/ui/src/layout';
import React from 'react';
import CompaignList from '../containers/CompaignList';
import FilterCompaign from './FilterCompaign';

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
      <CompaignList queryParams={queryParams} history={history} />
      <FilterCompaign queryParams={queryParams} history={history}/>
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
