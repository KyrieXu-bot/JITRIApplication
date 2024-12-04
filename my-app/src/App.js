import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import FormPage from './pages/FormPage';
import CustomerPage from './pages/CustomerPage';
import PaymentPage from './pages/PaymentPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/customer" element={<CustomerPage />} />
        <Route path="/payment" element={<PaymentPage />} />

      </Routes>
    </Router>
    
  );
}

export default App;
