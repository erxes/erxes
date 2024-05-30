import React from "react";
import { Route, useLocation } from "react-router-dom";
import queryString from "query-string";
import OnBoarding from "./container/OnBoarding";

const routes = ({ currentUser }) => {
  const Onboarding = () => {
    const location = useLocation();
    const queryParams = queryString.parse(location.search);
    return <OnBoarding currentUser={currentUser} queryParams={queryParams} />;
  };

  return (
    <Route key="/onboarding" path="/onboarding" element={<Onboarding />} />
  );
};

export default routes;
