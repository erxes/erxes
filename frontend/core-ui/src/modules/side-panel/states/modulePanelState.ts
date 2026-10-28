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

export const getModulePanelPath = (name: string) =>
  `/module/${encodeURIComponent(name)}`;
export const isModulePanelPath = (path: string | null) =>
  !!path?.startsWith('/module/');

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
