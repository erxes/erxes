import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const IntegrationsMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        {/* <Route path="/lottery" element={<Lottery />} />
        <Route path="/agent" element={<Agent />} /> */}
      </Routes>
    </Suspense>
  );
};

export default IntegrationsMain;
