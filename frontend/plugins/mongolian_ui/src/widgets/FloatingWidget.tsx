import { useLocation } from 'react-router-dom';
import { EbarimtRespondedPage } from '~/pages/EbarimtRespondedPage';

const FloatingWidget = () => {
  const { pathname } = useLocation();
  if (pathname !== '/sales/deals') {
    return;
  }

  return (
    <EbarimtRespondedPage />
  );
};

export default FloatingWidget;
