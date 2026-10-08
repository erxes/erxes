import { PrintDocument } from 'ui-modules';

import { IDeal } from '@/deals/types/deals';

const DEAL_DOCUMENT_CONTENT_TYPE = 'sales:deal';

export const DealPrintDocument = ({
  deals,
  open,
  onOpenChange,
}: {
  deals: Pick<IDeal, '_id'>[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <PrintDocument
    items={deals}
    contentType={DEAL_DOCUMENT_CONTENT_TYPE}
    open={open}
    onOpenChange={onOpenChange}
    trigger={null}
  />
);
