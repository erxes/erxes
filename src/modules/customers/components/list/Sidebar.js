import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { CountsByTag } from 'modules/common/components';
import Segments from 'modules/segments/containers/Filter';

const propTypes = {
  counts: PropTypes.object.isRequired,
  tags: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired
};

function Sidebar({ counts, tags, loading }) {
  return (
    <Wrapper.Sidebar>
      <Segments contentType="customer" counts={counts.bySegment} />
      <CountsByTag
        tags={tags}
        counts={counts.byTag}
        manageUrl="tags/customer"
        loading={loading}
      />
    </Wrapper.Sidebar>
  );
}

Sidebar.propTypes = propTypes;

export default Sidebar;
