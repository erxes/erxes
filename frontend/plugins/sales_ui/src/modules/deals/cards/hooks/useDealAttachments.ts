import { IDealDetail } from '@/deals/types/deals';
import { isDefined } from 'erxes-ui';
import { useMemo } from 'react';

export const useDealAttachments = (deal: IDealDetail) =>
  useMemo(() => deal.attachments?.filter(isDefined) ?? [], [deal.attachments]);
