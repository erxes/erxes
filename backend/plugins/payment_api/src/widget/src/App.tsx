import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { API_URL } from './config';
import InvoiceDetail from './pages/InvoiceDetail';

function App() {
  const widgetBasePath = new URL(
    `${API_URL.replace(/\/$/, '')}/pl:payment/widget`,
  ).pathname;

  return (
    <Router basename={widgetBasePath}>
      <Routes>
        <Route
          path="/pl:payment/widget/invoice/:id"
          element={<InvoiceDetail />}
        />
      </Routes>
    </Router>
  );
}

export default App;
