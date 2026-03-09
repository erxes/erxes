import { useLocation } from 'react-router-dom';
import { EbarimtRespondedPage } from '~/pages/EbarimtRespondedPage';
import { ProductPlacesRespondedPage } from '~/pages/productplaces/ProductPlacesRespondedPage';

const FloatingWidget = () => {
  const { pathname } = useLocation();

  return (
    <>
      <EbarimtRespondedPage />
      <ProductPlacesRespondedPage />
      {pathname === '/sales/deals' && (
        /* other floating widgets go here */
        <div>Your widget</div>
      )}
    </>
  );
};

export default FloatingWidget;
