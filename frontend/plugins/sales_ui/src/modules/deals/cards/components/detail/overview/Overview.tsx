import ActivityLogs from './activity/ActivityLogs';
import { AttachmentProvider } from './attachments/AttachmentContext';
import AttachmentUploader from './attachments/AttachmentUploader';
import Attachments from './attachments/Attachments';
import ChecklistOverview from './checklist/ChecklistOverview';
import { Checklists } from './checklist/Checklists';
import { DealsProvider } from '@/deals/context/DealContext';
import { IAttachment } from '@/deals/types/attachments';
import { IDeal } from '@/deals/types/deals';
import MainOverview from './MainOverview';
import SalesDescription from './SalesDescription';
import SalesNoteAndComment from './NoteAndComment';

const Overview = ({ deal }: { deal: IDeal }) => {
  return (
    <DealsProvider>
      <AttachmentProvider
        initialAttachments={deal.attachments || ([] as IAttachment[])}
      >
        <div className="border-b">
          <SalesDescription
            dealDescription={deal.description || []}
            dealId={deal._id}
          />
          <div className="flex gap-4 py-2 px-4">
            <ChecklistOverview />
            <AttachmentUploader />
          </div>
        </div>
        <div className="border-b">
          <Attachments />
        </div>
        <div className="overview">
          <MainOverview deal={deal} />
          <Checklists />
        </div>
        <SalesNoteAndComment />
        <ActivityLogs />
      </AttachmentProvider>
    </DealsProvider>
  );
};

export default Overview;
