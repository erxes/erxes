import { ComponentType, createContext, useContext } from 'react';
import { TRelationEntity } from '../utils';

export interface IRecordViewProps {
  record: TRelationEntity;
  onBack?: () => void;
  onClose: () => void;
}

/**
 * The host's record view — what the side panel shows for a record — given
 * so a record can be shown where the panel cannot reach, e.g. beside a
 * modal sheet. `null` when no host provides one.
 */
export const RecordViewContext =
  createContext<ComponentType<IRecordViewProps> | null>(null);

export const useRecordView = () => useContext(RecordViewContext);

/**
 * Navigation for records shown outside the side panel: inside it,
 * `useSidePanel` opens related records here instead of in the panel.
 */
export interface ISidePanelNavigator {
  record: TRelationEntity | null;
  // Records open stacked there; `replace` swaps the top one (a draft once
  // saved).
  openRecord: (
    entity: TRelationEntity,
    options?: { stack?: boolean; replace?: boolean },
  ) => void;
  back: () => void;
  canGoBack: boolean;
  close: () => void;
}

export const SidePanelNavigatorContext =
  createContext<ISidePanelNavigator | null>(null);
