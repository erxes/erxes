import SettingsContainer from '../../modules/productplaces/containers/Settings';
import PrintConfig from '../../modules/productplaces/components/PrintConfig';

const PrintPage = () => {
  return (
    <SettingsContainer
      component={PrintConfig}
      configCode="dealsProductsDataPrint"
    />
  );
};

export default PrintPage;