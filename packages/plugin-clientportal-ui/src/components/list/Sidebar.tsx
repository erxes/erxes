import DateFilters from '@erxes/ui-forms/src/forms/containers/DateFilters';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { Counts } from '@erxes/ui/src/types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React from 'react';

import ClientPortalIdFilter from '../../containers/ClientPortalIdFilter';
import TypeFilter from '../../containers/TypeFilter';

type Props = {
  loadingMainQuery: boolean;
  counts: {
    byCP: Counts;
    byType: Counts;
  };
};

function Sidebar({ counts, loadingMainQuery }: Props) {
  return (
    <Wrapper.Sidebar>
      {isEnabled('clientportal') && (
        <>
          <ClientPortalIdFilter counts={counts.byCP} />
          <TypeFilter counts={counts.byType} />
        </>
      )}
      {isEnabled('forms') && (
        <DateFilters
          type="clientportal:user"
          loadingMainQuery={loadingMainQuery}
        />
      )}
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
