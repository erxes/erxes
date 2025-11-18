import React from 'react';
import ActivityLogs from './activity/ActivityLogs';
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
import {
  SalesDetailLeftSidebar,
  SalesDetailTabContent,
} from '../SalesDetailLeftSidebar';
import Products from '../products/Products';

interface Props {
  deal: IDeal;
}

const Overview: React.FC<Props> = ({ deal }) => {
  return (
    <AttachmentProvider
      initialAttachments={deal.attachments || ([] as IAttachment[])}
    >
      <div className="flex h-full ">
        <SalesDetailLeftSidebar>
          <SalesDetailTabContent value="overview">
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

            <div className="overview flex-1">
              <MainOverview deal={deal} />
              <Checklists />
            </div>

            <SalesNoteAndComment />
            <ActivityLogs />
          </SalesDetailTabContent>
          <div className="">
            <SalesDetailTabContent value="products">
              <SalesDetailTabContent value="products">
                <Products deal={deal} />
              </SalesDetailTabContent>
            </SalesDetailTabContent>
          </div>
        </SalesDetailLeftSidebar>
      </div>
    </AttachmentProvider>
  );
};

export default Overview;
