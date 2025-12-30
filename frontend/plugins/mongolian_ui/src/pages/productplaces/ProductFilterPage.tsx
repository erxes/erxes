import React from 'react';
import SettingsContainer from '../../modules/productplaces/containers/Settings';
import DefaultFilterSettings from '../../modules/productplaces/components/DefaultFilterSettings';

const ProductFilterPage = () => {
  return (
    <SettingsContainer
      component={DefaultFilterSettings}
      configCode="dealsProductsDefaultFilter"
    />
  );
};

export default ProductFilterPage;