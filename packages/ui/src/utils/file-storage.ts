/**
 * Where erxes-ui's upload hooks send files. The host app (core-ui) sets an
 * adapter for its file service; without one, the hooks use the old
 * `/upload-file` endpoints as before, so existing setups keep working.
 * erxes-ui is a Module Federation singleton, so plugin UIs get the host's
 * adapter too.
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

export const getFileStorage = () => adapter;
