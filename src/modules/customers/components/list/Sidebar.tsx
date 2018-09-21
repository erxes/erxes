import { CountsByTag } from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import Segments from 'modules/segments/containers/Filter';
import * as React from 'react';
import { IntegrationFilter, LeadStatusFilter, LifecycleStateFilter } from '../';
import { ITag } from '../../../tags/types';
import { BrandFilter, FormFilter } from '../../containers';

type Props = {
  counts: any;
  tags: ITag[];
  loading: boolean;
};

function Sidebar({ counts, tags, loading }: Props) {
  return (
    <Wrapper.Sidebar>
      <Segments contentType="customer" counts={counts.bySegment} />
      <CountsByTag
        tags={tags}
        counts={counts.byTag}
        manageUrl="tags/customer"
        loading={loading}
      />
      <IntegrationFilter counts={counts.byIntegrationType} />
      <BrandFilter counts={counts.byBrand} />
      <FormFilter counts={counts.byForm} />
      <LeadStatusFilter counts={counts.byLeadStatus} loading={loading} />
      <LifecycleStateFilter
        counts={counts.byLifecycleState}
        loading={loading}
      />
    </Wrapper.Sidebar>
  );
}

export default Sidebar;
