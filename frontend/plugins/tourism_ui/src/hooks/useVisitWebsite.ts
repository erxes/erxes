import { useCallback } from 'react';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('tourism');
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
          title: t('error'),
          description: t('unable-to-open-website'),
          variant: 'destructive',
        });
        return;
      }

      window.open(url, '_blank', 'noopener,noreferrer');
    },
    [list, type],
  );
};
