import React from 'react';
import SettingsContainer from '../../modules/productplaces/containers/Settings';
import DefaultFilterSettings from '../../modules/productplaces/components/DefaultFilterSettings';

const DefaultFilterPage = () => {
  return (
    <SettingsContainer
      component={DefaultFilterSettings}
      configCode="PRODUCT_PLACES_DEFAULT_FILTER"
    />
  );
};

export default DefaultFilterPage;
