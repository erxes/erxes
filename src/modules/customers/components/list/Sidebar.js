import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import Segments from 'modules/segments/containers/Filter';

const propTypes = {
  counts: PropTypes.object.isRequired
};

function Sidebar({ counts }) {
  return (
    <Wrapper.Sidebar>
      <Segments contentType="customer" counts={counts.bySegment} />
    </Wrapper.Sidebar>
  );
}

Sidebar.propTypes = propTypes;

export default Sidebar;
