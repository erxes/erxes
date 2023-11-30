import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';

import CategoryList from '../containers/CategoryList';

function Sidebar({
  history,
  queryParams
}: {
  loadingMainQuery: boolean;
  history: any;
  queryParams: any;
}) {
  return (
    <Wrapper.Sidebar>
      <CategoryList queryParams={queryParams} history={history} />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
