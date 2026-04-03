import { AttachmentProvider } from './attachments/AttachmentContext';
import AttachmentUploader from './attachments/AttachmentUploader';
import Attachments from './attachments/Attachments';
import ChecklistOverview from './checklist/ChecklistOverview';
import { Checklists } from './checklist/Checklists';
import { IAttachment } from '@/deals/types/attachments';
import { IDeal } from '@/deals/types/deals';
import MainOverview from './MainOverview';
import SalesNoteAndComment from './NoteAndComment';

const Overview = ({ deal }: { deal: IDeal }) => {
  return (
    <AttachmentProvider
      initialAttachments={deal.attachments || ([] as IAttachment[])}
    >
      <MainOverview deal={deal} />
      <div className="border-b">
        <div className="flex justify-between">
          <div className="flex gap-4 py-2 px-4">
            <ChecklistOverview />
            <AttachmentUploader />
          </div>
        </div>
      </div>
      <Attachments />
      <Checklists stageId={deal.stageId} dealId={deal._id} />
      <SalesNoteAndComment dealId={deal._id} />
    </AttachmentProvider>
  );
};

export default Overview;
