import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

const Index = () => {
  return <Navigate to={`/onboarding`} />;
};

function OnboardingLayout({ children }) {
  return (
    <Routes>
      <Route path="*" key="root" element={<Index/>} />
      {children}
    </Routes>
  );
}

export default OnboardingLayout;
