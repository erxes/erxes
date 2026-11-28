import { createContext } from 'react';
import type { TRelationEntity } from './sidePanelPaths';

export interface IRecordViewProps {
  record: TRelationEntity;
  onBack?: () => void;
  // Missing on a record's own page: there is nothing to close back to.
  onClose?: () => void;
}

export interface IOpenRecordOptions {
  // Opened from inside the panel (a related record): Back returns here.
  stack?: boolean;
  // Takes the open record's place, Back unchanged: a draft once saved.
  replace?: boolean;
  // The tab it opens on; a tab the record lacks, like none, opens its default.
  tab?: string;
}

/**
 * Navigation for records shown outside the side panel (a record's own page):
 * inside it, `useSidePanel` opens related records here instead of in the panel.
 */
export interface ISidePanelNavigator {
  record: TRelationEntity | null;
  // Empty selects the record's default tab.
  tab: string;
  setTab: (tab: string) => void;
  openRecord: (entity: TRelationEntity, options?: IOpenRecordOptions) => void;
  /** Shows another record in this one's place: its own page. */
  replaceRecord: (entity: TRelationEntity) => void;
  back: () => void;
  canGoBack: boolean;
  close: () => void;
}

export const SidePanelNavigatorContext = createContext<ISidePanelNavigator | null>(null);

/** Opens a record as `useSidePanel().openRecord(entity)` does there; `PanelRecordOpener` gives it. */
export const PanelOpenRecordContext = createContext<((entity: TRelationEntity) => void) | null>(
  null,
);

// The panel route of the record a view belongs to (one stack entry).
export const SidePanelRecordPathContext = createContext<string | null>(null);
