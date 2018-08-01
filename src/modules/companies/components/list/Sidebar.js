import React from 'react';
import PropTypes from 'prop-types';

import { Wrapper } from 'modules/layout/components';
import { CountsByTag } from 'modules/common/components';
import Segments from 'modules/segments/containers/Filter';
import CountsByLeadStatus from './CountsByLeadStatus';

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
      <CountsByLeadStatus counts={counts.byLead} loading={loading} />
    </Wrapper.Sidebar>
  );
}

Sidebar.propTypes = propTypes;

export default Sidebar;
