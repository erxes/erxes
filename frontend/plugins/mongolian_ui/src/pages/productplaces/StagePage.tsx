import SettingsContainer from '../../modules/productplaces/containers/Settings';
import PlaceConfig from '../../modules/productplaces/components/PlaceConfig';

const StagePage = () => {
  return (
    <SettingsContainer
      component={PlaceConfig}
      configCode="dealsProductsDataPlaces"
    />
  );
};

export default StagePage;