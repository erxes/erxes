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
    const match = /^([^/]+:[^/]+)\/([^/]+)\/tab:([^/]+)\//.exec(name);
    const draft = /\/draft:([^/]*)\//.exec(name);
    return match
      ? {
          contentType: match[1],
          contentId: match[2],
          tab: match[3],
          draftId: draft?.[1] || 'new',
        }
      : null;
  } catch {
    return null;
  }
};
