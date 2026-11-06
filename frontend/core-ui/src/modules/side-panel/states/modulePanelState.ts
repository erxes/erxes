import { atom } from 'jotai';

export interface IModulePanelEntry {
  onClose: () => void;
  maxWidth?: number;
  defaultWidth?: number;
}

export const modulePanelEntriesState = atom<Record<string, IModulePanelEntry>>(
  {},
);
export const modulePanelTargetsState = atom<Record<string, HTMLElement>>({});

/** Encodes a module editor namespace as a panel route. */

export const getModulePanelPath = (name: string) =>
  `/module/${encodeURIComponent(name)}`;
/** Recognizes module routes without treating record routes as module editors. */
export const isModulePanelPath = (path: string | null) =>
  Boolean(path?.startsWith('/module/'));

/** Recovers the parent record, tab, and draft identity encoded by a nested editor. */

export const getModulePanelRecordView = (path: string) => {
  if (!isModulePanelPath(path)) return null;
  try {
    const name = decodeURIComponent(path.slice('/module/'.length));
    const parts = name.split('/');
    const [contentType, contentId, tabSegment] = parts;
    if (
      !contentType.slice(1, -1).includes(':') ||
      !contentId ||
      !tabSegment?.startsWith('tab:') ||
      tabSegment.length === 4 ||
      parts.length < 4
    ) {
      return null;
    }
    const draft = parts.slice(1, -1).find((part) => part.startsWith('draft:'));
    return {
      contentType,
      contentId,
      tab: tabSegment.slice(4),
      draftId: draft?.slice('draft:'.length) || 'new',
    };
  } catch {
    return null;
  }
};
