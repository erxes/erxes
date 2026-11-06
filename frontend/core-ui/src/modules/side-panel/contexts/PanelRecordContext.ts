import { createContext } from 'react';
import { TRelationEntity } from 'ui-modules';

export const PanelRecordContext = createContext<
  (TRelationEntity & { tab?: string; draftId?: string }) | null
>(null);
