import { useLocation } from 'react-router-dom';
import { EbarimtRespondedPage } from '~/pages/EbarimtRespondedPage';
import { ProductPlacesRespondedPage } from '~/pages/productplaces/ProductPlacesRespondedPage';

const FloatingWidget = () => {
  const { pathname } = useLocation();

  if (pathname !== '/sales/deals') {
    return null;
  }

  return (
    <>
      <EbarimtRespondedPage />
      <ProductPlacesRespondedPage />
    </>
  );
};

export default FloatingWidget;
