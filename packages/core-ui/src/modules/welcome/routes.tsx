import { Route, Routes } from 'react-router-dom';

import React from 'react';
import Welcome from './container/Welcome';

const routes = (currentUser) => {
  return (
    <Routes>
      <Route
        key="/welcome"
        path="/welcome"
        element={<Welcome currentUser={currentUser} />}
      />
    </Routes>
  );
};

export default routes;
