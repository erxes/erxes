import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Main from './modules/Main';

function App() {
  return (
    <Routes>
      <Route path="/plugins/branched/*" element={<Main />} />
    </Routes>
  );
}

export default App;