import React from 'react';
import { Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { TicketTagsPage } from '~/pages/TicketTagsPage';
const Settings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<TicketTagsPage />} />
      </Routes>
    </Suspense>
  );
};

export default Settings;
