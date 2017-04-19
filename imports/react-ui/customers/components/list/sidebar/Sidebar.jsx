import React, { PropTypes } from 'react';
import { Wrapper } from '/imports/react-ui/layout/components';
import Segments from './Segments.jsx';
import Brands from './Brands.jsx';
import Integrations from './Integrations.jsx';
import Tags from './Tags.jsx';

const propTypes = {
  segments: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  integrations: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
};

function Sidebar({ segments, brands, integrations, tags }) {
  return (
    <Wrapper.Sidebar>
      <Segments segments={segments} />
      <Brands brands={brands} />
      <Integrations integrations={integrations} />
      <Tags tags={tags} />
    </Wrapper.Sidebar>
  );
}

Sidebar.propTypes = propTypes;

export default Sidebar;
