import { addPluginStyles } from 'erxes-ui';
import { Route, Routes } from 'react-router-dom';
import { ItemsPage } from './items/ItemsPage.tsx';
import { PLUGIN } from './orpc.ts';
import css from './styles.css?inline';

addPluginStyles(PLUGIN, css);

/** The page module web renders under `/__id__/*` (loaded as `__id___ui/__id__`). */
export const __Pascal__ = () => (
  <Routes>
    <Route index element={<ItemsPage />} />
  </Routes>
);
