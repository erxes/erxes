import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EBarimtSettings from '@/ebarimt/settings/components/EBarimtSettings';
import ErkhetSettings from '@/erkhet-sync/settings/components/ErkhetSettings';

const MongolianSettings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="ebarimt/*" element={<EBarimtSettings />} />
        <Route index element={<Navigate to="ebarimt" replace />} />
      </Routes>
      <Routes>
        <Route path="sync-erkhet/*" element={<ErkhetSettings />} />
        <Route index element={<Navigate to="sync-erkhet" replace />} />
      </Routes>
      <Routes>
        <Route path="product-places/*" element={<ErkhetSettings />} />
        <Route index element={<Navigate to="sync-erkhet" replace />} />
      </Routes>
    </Suspense>
  );
};

export default MongolianSettings;
