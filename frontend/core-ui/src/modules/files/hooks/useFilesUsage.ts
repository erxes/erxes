import { useQuery } from '@apollo/client';
import { FILES_USAGE, IFilesUsage } from 'ui-modules';

export const useFilesUsage = () => {
  const { data, loading } = useQuery<{ filesUsage: IFilesUsage }>(FILES_USAGE);
  const usage = data?.filesUsage;
  const percent =
    usage?.quotaBytes && usage.quotaBytes > 0
      ? Math.min(100, Math.round((usage.usedBytes / usage.quotaBytes) * 100))
      : null;

  return { usage, percent, loading };
};
