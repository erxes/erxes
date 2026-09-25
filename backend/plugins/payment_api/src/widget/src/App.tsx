import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { API_URL } from './config';
import InvoiceDetail from './pages/InvoiceDetail';
import PaymentFailed from './pages/PaymentFailed';

function App() {
  const widgetBasePath = new URL(
    `${API_URL.replace(/\/$/, '')}/pl:payment/widget`,
  ).pathname;

  return (
    <Router basename={widgetBasePath}>
      <Routes>
        <Route path="/invoice/:id" element={<InvoiceDetail />} />
        <Route path="/payment-failed/:id" element={<PaymentFailed />} />
      </Routes>
    </Router>
  );
}

export default App;
