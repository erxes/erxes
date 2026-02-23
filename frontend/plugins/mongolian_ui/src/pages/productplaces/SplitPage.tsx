import React from 'react';
import SettingsContainer from '../../modules/productplaces/containers/Settings';
import SplitConfig from '../../modules/productplaces/components/SplitConfig';

const SplitPage = () => (
  <SettingsContainer
    component={SplitConfig}
    configCode="dealsProductsDataSplit"
  />
);

export default SplitPage;
