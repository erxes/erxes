import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { Counts } from '@erxes/ui/src/types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import React from 'react';

import ClientPortalIdFilter from '../../containers/ClientPortalIdFilter';
import TypeFilter from '../../containers/TypeFilter';

type Props = {
  counts: {
    byCP: Counts;
    byType: Counts;
  };
};

function Sidebar({ counts }: Props) {
  return (
    <Wrapper.Sidebar>
      {isEnabled('clientportal') && (
        <>
          <ClientPortalIdFilter counts={counts.byCP} />
          <TypeFilter counts={counts.byType} />
        </>
      )}
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
