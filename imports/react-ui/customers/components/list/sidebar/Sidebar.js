import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from '/imports/react-ui/layout/components';
import { CountsByTag } from '/imports/react-ui/common';
import Segments from './Segments';
import Brands from './Brands';
import Integrations from './Integrations';

const propTypes = {
  counts: PropTypes.object.isRequired,
  segments: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  integrations: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
};

function Sidebar({ counts, segments, brands, integrations, tags }) {
  return (
    <Wrapper.Sidebar>
      <Segments segments={segments} counts={counts.bySegment} />
      <Brands brands={brands} counts={counts.byBrand} />
      <Integrations integrations={integrations} counts={counts.byIntegrationType} />

      <CountsByTag tags={tags} counts={counts.byTag} manageUrl="tags/customer" />
    </Wrapper.Sidebar>
  );
}

Sidebar.propTypes = propTypes;

export default Sidebar;
