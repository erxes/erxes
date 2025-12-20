import React from 'react';
import SettingsContainer from '../../modules/productplaces/containers/Settings';
import SplitSettings from '../../modules/productplaces/components/SplitSettings';

const SplitPage = () => {
  return (
    <SettingsContainer
      component={SplitSettings}
      configCode="PRODUCT_PLACES_SPLIT"
    />
  );
};

export default SplitPage;
