import SettingsContainer from '../../modules/productplaces/containers/Settings';
import DefaultFilterConfig from '../../modules/productplaces/components/DefaultFilterConfig';

const ProductFilterPage = () => {
  return (
    <SettingsContainer
      component={DefaultFilterConfig}
      configCode="dealsProductsDefaultFilter"
      multiple
    />
  );
};

export default ProductFilterPage;
