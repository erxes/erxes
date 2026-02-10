import { Routes, Route } from 'react-router-dom';
import ExchangeRateFormContainer from '../../modules/exchangeRates/containers/ExchangeRateForm';

const ExchangeRateFormPage = () => {
  return (
    <Routes>
      <Route path="create" element={<ExchangeRateFormContainer />} />
      <Route path=":id" element={<ExchangeRateFormContainer />} />
    </Routes>
  );
};

export default ExchangeRateFormPage;
