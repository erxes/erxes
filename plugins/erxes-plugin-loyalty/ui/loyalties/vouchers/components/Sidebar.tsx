import { Wrapper } from 'erxes-ui';
import React from 'react';
import CompaignList from '../containers/CompaignList';

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
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
