import React from 'react';
import SettingsContainer from '../../modules/productplaces/containers/Settings';
import StageSettings from '../../modules/productplaces/components/StageSettings';

const StagePage = () => {
  console.log('StagePage rendered');
  
  return (
    <div>
      <div style={{color: 'green', padding: '10px'}}>DEBUG: StagePage is rendering</div>
      <SettingsContainer
        component={StageSettings}
        configCode="PRODUCT_PLACES_STAGE"
      />
    </div>
  );
};

export default StagePage;