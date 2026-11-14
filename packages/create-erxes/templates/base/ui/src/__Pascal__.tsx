import { Route, Routes } from 'react-router-dom';
import { ItemsPage } from './items/ItemsPage.tsx';

/** The page module web renders under `/__id__/*` (loaded as `__id___ui/__id__`). */
export const __Pascal__ = () => (
  <Routes>
    <Route index element={<ItemsPage />} />
  </Routes>
);
