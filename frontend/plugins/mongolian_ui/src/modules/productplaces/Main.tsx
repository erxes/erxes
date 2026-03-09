import ProductPlacesSettings from './components/ProductPlacesSettings';
import { ProductPlacesRespondedPage } from '../../pages/productplaces/ProductPlacesRespondedPage';

const Main = () => {
  return (
    <div className="h-full">
      <ProductPlacesRespondedPage />
      <ProductPlacesSettings />
    </div>
  );
};

export default Main;