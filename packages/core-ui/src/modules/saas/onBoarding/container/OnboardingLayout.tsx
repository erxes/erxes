import React from 'react';
import { Redirect, Route } from 'react-router-dom';

function OnboardingLayout({ children }) {
  const index = ({ location }) => {
    return <Redirect to={`/onboarding`} />;
  };

  return (
    <>
      <Route exact={true} path="*" key="root" render={index} />
      {children}
    </>
  );
}

export default OnboardingLayout;
