import React from 'react';
import SettingsContainer from '../../modules/productplaces/containers/Settings';
import StageSettings from '../../modules/productplaces/components/StageSettings';

const StagePage = () => {
  return (
    <SettingsContainer
      component={StageSettings}
      configCode="dealsProductsDataPlaces"
    />
  );
};

export default StagePage;