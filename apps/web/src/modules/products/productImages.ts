import { CORE_API_PREFIX } from '@erxes/core-contract';

/** A core file's stable address, for `<img src>` (it redirects to the stored bytes). */
export const fileUrl = (id: string) =>
  `${CORE_API_PREFIX}/files/${encodeURIComponent(id)}/download`;
