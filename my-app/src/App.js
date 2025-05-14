import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import FormPage from './pages/FormPage';
import CustomerPage from './pages/CustomerPage';
import PaymentPage from './pages/PaymentPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // return (
  //   <Router>
  //     <Routes>
  //       <Route path="/" element={<LoginPage />} />
  //       <Route path="/home" element={<HomePage />} />
  //       <Route path="/form" element={<FormPage />} />
  //       <Route path="/customer" element={<CustomerPage />} />
  //       <Route path="/payment" element={<PaymentPage />} />

  //     </Routes>
  //   </Router>
    
  // );

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />}
        />
        <Route
          path="/home"
          element={isAuthenticated ? <HomePage /> : <Navigate to="/" />}
        />
        <Route
          path="/form"
          element={isAuthenticated ? <FormPage /> : <Navigate to="/" />}
        />
        <Route
          path="/customer"
          element={isAuthenticated ? <CustomerPage /> : <Navigate to="/" />}
        />
        <Route
          path="/payment"
          element={isAuthenticated ? <PaymentPage /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );

}

export default App;
