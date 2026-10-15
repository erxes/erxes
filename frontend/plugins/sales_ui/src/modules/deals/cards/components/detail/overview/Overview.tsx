import { IDealDetail } from '@/deals/types/deals';
import { isDefined, Separator } from 'erxes-ui';
import { AttachmentProvider } from './attachments/AttachmentContext';
import { SalesNoteAndComment } from './NoteAndComment';
import { SalesFormFields } from './SalesFormFields';

export const Overview = ({ deal }: { deal: IDealDetail }) => {
  return (
    <AttachmentProvider
      dealId={deal._id}
      initialAttachments={deal.attachments?.filter(isDefined) || []}
    >
      <div className="w-full xl:max-w-6xl mx-auto p-6 flex flex-col gap-3">
        <SalesFormFields deal={deal} />
        <Separator className="mt-1" />
        <SalesNoteAndComment dealId={deal._id} />
      </div>
    </AttachmentProvider>
  );
};
