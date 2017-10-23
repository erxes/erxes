import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { CountsByTag } from 'modules/common/components';
import Segments from 'modules/segments/containers/Filter';
import Brands from './Brands';
import Integrations from './Integrations';

const propTypes = {
  counts: PropTypes.object.isRequired,
  brands: PropTypes.array.isRequired,
  integrations: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired
};

function Sidebar({ counts, brands, integrations, tags }) {
  return (
    <Wrapper.Sidebar>
      <Segments contentType="customer" counts={counts.bySegment} />
      <Brands brands={brands} counts={counts.byBrand} />
      <Integrations
        integrations={integrations}
        counts={counts.byIntegrationType}
      />

      <CountsByTag
        tags={tags}
        counts={counts.byTag}
        manageUrl="tags/customer"
      />
    </Wrapper.Sidebar>
  );
}

Sidebar.propTypes = propTypes;

export default Sidebar;
