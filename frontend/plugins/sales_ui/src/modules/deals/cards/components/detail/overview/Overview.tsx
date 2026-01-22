import { AttachmentProvider } from './attachments/AttachmentContext';
import AttachmentUploader from './attachments/AttachmentUploader';
import Attachments from './attachments/Attachments';
import ChecklistOverview from './checklist/ChecklistOverview';
import { Checklists } from './checklist/Checklists';
import { IAttachment } from '@/deals/types/attachments';
import { IDeal } from '@/deals/types/deals';
import MainOverview from './MainOverview';
import SalesDescription from './SalesDescription';
import SalesNoteAndComment from './NoteAndComment';

const Overview = ({ deal }: { deal: IDeal }) => {
  return (
    <AttachmentProvider
      initialAttachments={deal.attachments || ([] as IAttachment[])}
    >
      <div className="border-b ">
        <SalesDescription
          dealDescription={deal.description || []}
          dealId={deal._id}
        />
        <div className="flex justify-between ">
          <div className="flex gap-4 py-2 px-4">
            <ChecklistOverview />
            <AttachmentUploader />
          </div>
        </div>
      </div>
      <Attachments />
      <div className="overview mb-4">
        <MainOverview deal={deal} />
        <Checklists />
      </div>
      <SalesNoteAndComment />
    </AttachmentProvider>
  );
};

export default Overview;
