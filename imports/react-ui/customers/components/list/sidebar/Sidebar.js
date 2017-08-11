import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from '/imports/react-ui/layout/components';
import { TagFilter } from '/imports/react-ui/common';
import Segments from './Segments';
import Brands from './Brands';
import Integrations from './Integrations';

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

      <TagFilter tags={tags} publishCountName="customers.tag." manageUrl="tags/customer" />
    </Wrapper.Sidebar>
  );
}

Sidebar.propTypes = propTypes;

export default Sidebar;
