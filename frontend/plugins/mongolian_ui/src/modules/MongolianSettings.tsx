import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EBarimtSettings from '@/ebarimt/settings/components/EBarimtSettings';

const MongolianSettings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="ebarimt/*" element={<EBarimtSettings />} />
        <Route index element={<Navigate to="ebarimt" replace />} />
      </Routes>
    </Suspense>
  );
};

export default MongolianSettings;
