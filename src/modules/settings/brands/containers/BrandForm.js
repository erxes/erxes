import * as React from 'react';
import PropTypes from 'prop-types';
import { BrandForm } from '../components';

const BrandFormContainer = props => {
  const { brand, save } = props;

  const updatedProps = {
    ...props,
    brand,
    save
  };

  return <BrandForm {...updatedProps} />;
};

BrandFormContainer.propTypes = {
  brand: PropTypes.object,
  save: PropTypes.func,
  loading: PropTypes.bool
};

export default BrandFormContainer;
