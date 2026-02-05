import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import templateMain from 'ui-modules/modules/template/Main';

export const TemplateRoutes = () => {
  const TemplateMain = templateMain;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/*" element={<TemplateMain />} />
      </Routes>
    </Suspense>
  );
};
