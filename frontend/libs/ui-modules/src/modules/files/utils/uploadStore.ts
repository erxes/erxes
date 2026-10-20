import { IFileUploadItem } from '../types';

type TListener = () => void;

let items: IFileUploadItem[] = [];
const listeners = new Set<TListener>();

const emit = () => listeners.forEach((listener) => listener());

/**
 * A module-level store rather than component state: uploads keep running
 * while the user navigates, and every panel or picker sees the same list.
 */
export const uploadStore = {
  subscribe(listener: TListener) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot: () => items,

  add(item: IFileUploadItem) {
    items = [...items, item];
    emit();
  },

  update(localId: string, patch: Partial<IFileUploadItem>) {
    items = items.map((item) =>
      item.localId === localId ? { ...item, ...patch } : item,
    );
    emit();
  },

  remove(localId: string) {
    items = items.filter((item) => item.localId !== localId);
    emit();
  },

  clearFinished() {
    items = items.filter((item) => item.status !== 'done');
    emit();
  },

  get: (localId: string) => items.find((item) => item.localId === localId),
};
