import React from 'react';
import PropTypes from 'prop-types';
import { Form } from '../components';

const TYPES = {
  PRODUCT: 'product',
  SERVICE: 'service',
  ALL_LIST: ['', 'product', 'service']
};

const ProductFormContainer = props => {
  const { save } = props;

  const loadTypes = Object.values(TYPES);
  loadTypes.splice(-1, 1);

  const updatedProps = {
    ...props,
    save,
    loadTypes
  };

  return <Form {...updatedProps} />;
};

ProductFormContainer.propTypes = {
  save: PropTypes.func
};

export default ProductFormContainer;
