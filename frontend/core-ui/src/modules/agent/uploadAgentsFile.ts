import { REACT_APP_API_URL } from 'erxes-ui';
import type { IAgentsFileMeta } from './agentsFiles';
import { mimeFromFile } from './agentsFiles';

/** Uses the platform `/upload-file` endpoint, same as the rest of erxes. */
export const uploadAgentsFile = async (
  file: File,
  options: { signal?: AbortSignal } = {},
): Promise<IAgentsFileMeta> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(
    `${REACT_APP_API_URL}/upload-file?kind=main`,
    {
      method: 'POST',
      body: formData,
      credentials: 'include',
      signal:
        options.signal ??
        (typeof AbortSignal.timeout === 'function'
          ? AbortSignal.timeout(60_000)
          : undefined),
    },
  );
  const text = (await response.text()).trim();

  if (!response.ok || !text) {
    throw new Error(text || `Upload failed (${response.status})`);
  }

  return {
    name: file.name,
    url: text,
    type: mimeFromFile(file),
    size: file.size,
  };
};
