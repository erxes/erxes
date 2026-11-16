import { AttachmentProvider } from '@/deals/cards/components/detail/overview/attachments/AttachmentContext';
import { AttachmentUploader } from '@/deals/cards/components/detail/overview/attachments/AttachmentUploader';
import { Attachments } from '@/deals/cards/components/detail/overview/attachments/Attachments';
import { ChecklistOverview } from '@/deals/cards/components/detail/overview/checklist/ChecklistOverview';
import { Checklists } from '@/deals/cards/components/detail/overview/checklist/Checklists';
import { useDealAttachments } from '@/deals/cards/hooks/useDealAttachments';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import { DealsProvider } from '@/deals/context/DealContext';
import { DealIdProvider } from '@/deals/context/DealIdContext';
import { IDealDetail } from '@/deals/types/deals';
import { IconListCheck } from '@tabler/icons-react';
import { Empty, ScrollArea } from 'erxes-ui';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PanelDescriptionField } from 'ui-modules';
import {
  DealFields,
  DEAL_PANEL_SCOPE,
} from '~/widgets/record-panel/DealPanelDetail';
import { DealPanelLoader } from '~/widgets/record-panel/DealPanelStates';

const DealPageScroll = ({
  dealId,
  className,
  children,
}: {
  dealId: string;
  className: string;
  children: (deal: IDealDetail) => ReactNode;
}) => (
  <DealPanelLoader dealId={dealId}>
    {(deal) => (
      <DealIdProvider value={dealId}>
        <DealsProvider>
          <ScrollArea
            className="flex-1 min-h-0"
            viewportClassName="[&>div]:block!"
          >
            <div className={className}>{children(deal)}</div>
          </ScrollArea>
        </DealsProvider>
      </DealIdProvider>
    )}
  </DealPanelLoader>
);

const DealDescription = ({ deal }: { deal: IDealDetail }) => {
  const { t } = useTranslation('sales');
  const { editDeals } = useDealsEdit();
  const initialAttachments = useDealAttachments(deal);

  return (
    <AttachmentProvider
      dealId={deal._id}
      initialAttachments={initialAttachments}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <AttachmentUploader />
        </div>
        <Attachments />
        <PanelDescriptionField
          key={deal._id}
          label={t('description')}
          value={deal.description || ''}
          scope={`${DEAL_PANEL_SCOPE}.page-description`}
          onSave={(description) =>
            editDeals({ variables: { _id: deal._id, description } })
          }
        />
      </div>
    </AttachmentProvider>
  );
};

const DealPageChecklistsContent = ({ deal }: { deal: IDealDetail }) => {
  const { t } = useTranslation('sales');
  const [newChecklistId, setNewChecklistId] = useState<string>();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <ChecklistOverview label={t('add')} onCreated={setNewChecklistId} />
      </div>
      <Checklists
        dealId={deal._id}
        stageId={deal.stageId ?? undefined}
        newChecklistId={newChecklistId}
        bare
        empty={
          <Empty className="border-0 bg-transparent">
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconListCheck />
              </Empty.Media>
              <Empty.Title>
                {t('no-checklists', 'No checklists yet')}
              </Empty.Title>
            </Empty.Header>
          </Empty>
        }
      />
    </div>
  );
};

export const DealPageFields = ({ dealId }: { dealId: string }) => (
  <DealPageScroll dealId={dealId} className="flex flex-col p-3">
    {(deal) => <DealFields deal={deal} />}
  </DealPageScroll>
);

export const DealPageChecklists = ({ dealId }: { dealId: string }) => (
  <DealPageScroll
    dealId={dealId}
    className="w-full max-w-5xl mx-auto px-4 py-6"
  >
    {(deal) => <DealPageChecklistsContent deal={deal} />}
  </DealPageScroll>
);

export const DealPageDescription = ({ dealId }: { dealId: string }) => (
  <DealPageScroll
    dealId={dealId}
    className="w-full max-w-5xl mx-auto px-4 py-6"
  >
    {(deal) => <DealDescription deal={deal} />}
  </DealPageScroll>
);
