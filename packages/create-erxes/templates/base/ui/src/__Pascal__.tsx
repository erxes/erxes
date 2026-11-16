import { addPluginStyles, RecordPage } from 'erxes-ui';
import { Route, Routes, useParams } from 'react-router-dom';
import { ItemsPage } from '@/items/ItemsPage.tsx';
import { ITEM_TYPE } from '@/items/useItems.ts';
import { PLUGIN } from '~/orpc.ts';
import css from './styles.css?inline';

addPluginStyles(PLUGIN, css);

/** An item on its own page, where its panel's expand button leads: core draws it full size. */
const ItemPage = () => <RecordPage contentType={ITEM_TYPE} contentId={useParams().id ?? ''} />;

/** The page module web renders under `/__id__/*` (loaded as `__id___ui/__id__`). */
export const __Pascal__ = () => (
  <Routes>
    <Route index element={<ItemsPage />} />
    <Route path=":id" element={<ItemPage />} />
  </Routes>
);
