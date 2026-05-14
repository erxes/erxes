import { useCallback } from 'react';
import { toast } from 'erxes-ui';
import { getWebsiteUrl } from '~/utils/websiteUrl';

type BranchWithWebsite = {
  _id: string;
  uiOptions?: {
    website?: string;
  };
};

export const useVisitWebsite = (
  type: 'pms' | 'tms',
  list: BranchWithWebsite[] | undefined,
) => {
  return useCallback(
    (branchId: string) => {
      const branch = list?.find((b) => b._id === branchId);

      if (!branch) return;

      const { protocol, hostname } = window.location;
      const url = getWebsiteUrl(
        type,
        hostname,
        protocol,
        branch.uiOptions?.website,
      );

      if (!url) {
        toast({
          title: 'Error',
          description: 'Unable to open website, unexpected hostname format',
          variant: 'destructive',
        });
        return;
      }

      window.open(url, '_blank', 'noopener,noreferrer');
    },
    [list, type],
  );
};
