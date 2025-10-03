import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import InvoiceDetail from './pages/InvoiceDetail';

function App() {

  return (
    <Router basename="/pl:payment/widget">
      <Routes>
        <Route path="/invoice/:id" element={<InvoiceDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
