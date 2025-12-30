import React from 'react';
import SettingsContainer from '../../modules/productplaces/containers/Settings';
import PrintSettings from '../../modules/productplaces/components/PrintSettings';

const PrintPage = () => {
  return (
    <SettingsContainer
      component={PrintSettings}
      configCode="dealsProductsDataPrint"
    />
  );
};

export default PrintPage;