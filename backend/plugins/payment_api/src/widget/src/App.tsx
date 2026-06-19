import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { API_URL } from './config';
import InvoiceDetail from './pages/InvoiceDetail';

function App() {
  const basename = new URL(`${API_URL}/widget`).pathname;

  return (
    <Router
      basename={basename}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/invoice/:id" element={<InvoiceDetail />} />
      </Routes>
    </Router>
  );
}

export default App;