import React from 'react';
import PropTypes from 'prop-types';
import { DealSection } from '../../components';
import { WithAction } from '../../containers';

const DealSectionContainer = props => {
  const { customerId } = props;

  const DealSectionWithAction = WithAction(DealSection, { customerId });

  return <DealSectionWithAction />;
};

DealSectionContainer.propTypes = {
  customerId: PropTypes.string
};

export default DealSectionContainer;
