import { AttachmentProvider } from './attachments/AttachmentContext';
import { Separator } from 'erxes-ui';
import { IAttachment } from '@/deals/types/attachments';
import { IDeal } from '@/deals/types/deals';
import { SalesNoteAndComment } from './NoteAndComment';
import { SalesFormFields } from './SalesFormFields';

export const Overview = ({ deal }: { deal: IDeal }) => {
  return (
    <AttachmentProvider
      dealId={deal._id}
      initialAttachments={deal.attachments || ([] as IAttachment[])}
    >
      <div className="w-full xl:max-w-6xl mx-auto p-6 flex flex-col gap-3">
        <SalesFormFields deal={deal} />
        <Separator className="mt-1" />
        <SalesNoteAndComment dealId={deal._id} />
      </div>
    </AttachmentProvider>
  );
};
