import { AttachmentProvider } from './attachments/AttachmentContext';
import { Separator } from 'erxes-ui';
import AttachmentUploader from './attachments/AttachmentUploader';
import Attachments from './attachments/Attachments';
import { IAttachment } from '@/deals/types/attachments';
import { IDeal } from '@/deals/types/deals';
import MainOverview from './MainOverview';
import SalesNoteAndComment from './NoteAndComment';

const Overview = ({ deal }: { deal: IDeal }) => {
  return (
    <AttachmentProvider
      dealId={deal._id}
      initialAttachments={deal.attachments || ([] as IAttachment[])}
    >
      <div className="w-full xl:max-w-3xl mx-auto p-6 flex flex-col gap-3">
        <MainOverview deal={deal} />
        <div className="flex items-center gap-1 -mx-2">
          <AttachmentUploader />
        </div>
        <Attachments />
        <Separator className="mt-1" />
        <SalesNoteAndComment dealId={deal._id} />
      </div>
    </AttachmentProvider>
  );
};

export default Overview;
