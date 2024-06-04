import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

function OnboardingLayout({ children }) {
  return (
    <>
      <Routes>
        <Route path="*" element={<Navigate to="/onboarding" />} />
      </Routes>
      {children}
    </>
  );
}

export default OnboardingLayout;
