import { useLocation } from 'react-router-dom';
import ExchangeRates from '../../modules/exchangeRates/containers/ExchangeRates';
import ExchangeRateFormPage from './ExchangeRateFormPage';

const IndexPage = () => {
  const location = useLocation();

  const queryParams = Object.fromEntries(
    new URLSearchParams(location.search),
  );

  return (
    <>
      <ExchangeRates queryParams={queryParams} />
      <ExchangeRateFormPage />
    </>
  );
};

export default IndexPage;
