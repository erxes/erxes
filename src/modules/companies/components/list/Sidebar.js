import * as React from 'react';
import PropTypes from 'prop-types';

import { Wrapper } from 'modules/layout/components';
import { CountsByTag } from 'modules/common/components';
import {
  LeadStatusFilter,
  LifecycleStateFilter
} from 'modules/customers/components';

import { BrandFilter } from 'modules/customers/containers';

import Segments from 'modules/segments/containers/Filter';

const propTypes = {
  counts: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired
};

function Sidebar({ counts, tags, loading }) {
  return (
    <Wrapper.Sidebar>
      <Segments contentType="company" counts={counts.bySegment} />
      <CountsByTag
        tags={tags}
        counts={counts.byTag}
        manageUrl="tags/company"
        loading={loading}
      />
      <LeadStatusFilter counts={counts.byLeadStatus} loading={loading} />
      <LifecycleStateFilter
        counts={counts.byLifecycleState}
        loading={loading}
      />
      <BrandFilter counts={counts.byBrand} loading={loading} />
    </Wrapper.Sidebar>
  );
}

Sidebar.propTypes = propTypes;

export default Sidebar;
