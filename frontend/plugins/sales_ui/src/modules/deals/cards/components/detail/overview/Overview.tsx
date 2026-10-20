import { IDealDetail } from '@/deals/types/deals';
import { isDefined, Separator } from 'erxes-ui';
import { useMemo } from 'react';
import { AttachmentProvider } from './attachments/AttachmentContext';
import { SalesNoteAndComment } from './NoteAndComment';
import { SalesFormFields } from './SalesFormFields';

export const Overview = ({ deal }: { deal: IDealDetail }) => {
  const initialAttachments = useMemo(
    () => deal.attachments?.filter(isDefined) ?? [],
    [deal.attachments],
  );

  return (
    <AttachmentProvider
      dealId={deal._id}
      initialAttachments={initialAttachments}
    >
      <div className="w-full xl:max-w-6xl mx-auto p-6 flex flex-col gap-3">
        <SalesFormFields deal={deal} />
        <Separator className="mt-1" />
        <SalesNoteAndComment dealId={deal._id} />
      </div>
    </AttachmentProvider>
  );
};
