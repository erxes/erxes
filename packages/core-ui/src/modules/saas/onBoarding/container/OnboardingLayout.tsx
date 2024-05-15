import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

function OnboardingLayout({ children }) {
  const Index = () => {
    return <Navigate to={`/onboarding`} />;
  };

  return (
    <Routes>
      <Route path="*" key="root" element={<Index/>} />
      {children}
    </Routes>
  );
}

export default OnboardingLayout;
