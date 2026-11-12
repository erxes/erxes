/**
 * Where erxes-ui's upload hooks and components send files. The host app
 * (core-ui) sets an adapter for its file service at start-up. erxes-ui is a
 * Module Federation singleton, so plugin UIs get the host's adapter too.
 */
export interface FileStorageAdapter {
  /** Stores the file and resolves to the address to keep (shown with `readImage`). */
  upload(
    file: File,
    options?: { onProgress?: (percent: number) => void; signal?: AbortSignal },
  ): Promise<string>;
  /** Deletes a file by the address `upload` returned. */
  remove?(address: string): Promise<void>;
}

let adapter: FileStorageAdapter | null = null;

export const setFileStorage = (next: FileStorageAdapter | null) => {
  adapter = next;
};

const storage = () => {
  if (!adapter) throw new Error('No file storage: the host app sets one with setFileStorage');

  return adapter;
};

export const storeFile = async (
  file: File,
  options?: Parameters<FileStorageAdapter['upload']>[1],
) => storage().upload(file, options);

export const removeStoredFile = async (address: string) => {
  const target = storage();

  if (!target.remove) throw new Error('This file storage cannot delete files');
  await target.remove(address);
};

export const errorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;
