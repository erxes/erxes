import { AttachmentProvider } from '@/deals/cards/components/detail/overview/attachments/AttachmentContext';
import { AttachmentUploader } from '@/deals/cards/components/detail/overview/attachments/AttachmentUploader';
import { Attachments } from '@/deals/cards/components/detail/overview/attachments/Attachments';
import { ChecklistOverview } from '@/deals/cards/components/detail/overview/checklist/ChecklistOverview';
import { Checklists } from '@/deals/cards/components/detail/overview/checklist/Checklists';
import { useDealAttachments } from '@/deals/cards/hooks/useDealAttachments';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import { SelectLabels } from '@/deals/components/common/filters/SelectLabel';
import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { DealContactsField } from '@/deals/components/deal-selects/DealContactsField';
import { SelectDealPriority } from '@/deals/components/deal-selects/SelectDealPriority';
import { DealsProvider } from '@/deals/context/DealContext';
import { DealIdProvider } from '@/deals/context/DealIdContext';
import { IDealDetail } from '@/deals/types/deals';
import {
  IconAlignLeft,
  IconBuildingSkyscraper,
  IconCalendar,
  IconCalendarDue,
  IconFlag,
  IconGitBranch,
  IconLabel,
  IconPlus,
  IconUser,
} from '@tabler/icons-react';
import {
  cn,
  CopyText,
  isDefined,
  RecordTableInlineCell,
  ScrollArea,
  TextField,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PANEL_TEXT_FIELD_CLASS_NAME,
  PanelDescriptionField,
  PanelField,
  TagsSelect,
} from 'ui-modules';
import { DealDetailSection } from '~/widgets/record-panel/DealDetailSection';
import { DealPanelBroker } from '~/widgets/record-panel/DealPanelBroker';
import {
  DealPanelBranchesCell,
  DealPanelDepartmentsCell,
  DealPanelMemberCell,
} from '~/widgets/record-panel/DealPanelCells';
import { DealPanelStage } from '~/widgets/record-panel/DealPanelStage';
import { DealPanelLoader } from '~/widgets/record-panel/DealPanelStates';
import {
  toList,
  useDealListField,
} from '~/widgets/record-panel/useDealListField';

export const DEAL_PANEL_SCOPE = 'side-panel-deal';

const DealPanelTags = ({ deal }: { deal: IDealDetail }) => {
  const { t } = useTranslation('sales');
  const tags = useDealListField(deal, 'tagIds');

  return (
    <DealDetailSection title={t('tags')}>
      <TagsSelect.Provider
        type="sales:deal"
        mode="multiple"
        scope={`${DEAL_PANEL_SCOPE}.tags`}
        value={tags.value}
        onValueChange={(value) => tags.setValue(toList(value))}
      >
        <RecordTableInlineCell.Trigger
          className="rounded-sm"
          aria-label={t('edit-tags')}
        >
          <TagsSelect.SelectedList
            maxVisible={3}
            className="min-w-0 overflow-hidden"
          />
          {!tags.value.length && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <IconPlus className="size-3.5" aria-hidden="true" />
              {t('add-tags')}
            </span>
          )}
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <TagsSelect.Content />
        </RecordTableInlineCell.Content>
      </TagsSelect.Provider>
    </DealDetailSection>
  );
};

export const DealFields = ({ deal }: { deal: IDealDetail }) => {
  const { t } = useTranslation('sales');
  const { editDeals } = useDealsEdit();
  const { _id } = deal;
  const assignees = useDealListField(deal, 'assignedUserIds');
  const branches = useDealListField(deal, 'branchIds');
  const departments = useDealListField(deal, 'departmentIds');

  return (
    <div className="flex min-w-0 flex-col">
      {(deal.number || deal.status === 'archived') && (
        <div className="flex items-center gap-2 pb-1">
          {deal.number && (
            <CopyText
              value={deal.number}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              #{deal.number}
            </CopyText>
          )}
          {deal.status === 'archived' && (
            <span className="rounded-sm border border-yellow-200 bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-800">
              {t('archived')}
            </span>
          )}
        </div>
      )}
      <DealDetailSection title={t('general')} nested>
        <PanelField icon={IconAlignLeft} label={t('name')}>
          <TextField
            scope={`${DEAL_PANEL_SCOPE}.name`}
            value={deal.name || ''}
            placeholder={t('deal-name')}
            data-panel-inline=""
            className={cn(
              PANEL_TEXT_FIELD_CLASS_NAME,
              'h-auto min-h-7 py-1.5 whitespace-normal [&>span]:whitespace-normal [&>span]:[overflow-wrap:anywhere]',
            )}
            onSave={(name) => {
              const trimmed = name.trim();
              if (trimmed && trimmed !== deal.name) {
                editDeals({ variables: { _id, name: trimmed } });
              }
            }}
          />
        </PanelField>
        <DealPanelStage deal={deal} />
        <PanelField icon={IconUser} label={t('assigned-to')}>
          <DealPanelMemberCell
            value={assignees.value}
            onValueChange={(value) => assignees.setValue(toList(value))}
          />
        </PanelField>
        <PanelField icon={IconFlag} label={t('priority')}>
          <SelectDealPriority
            dealId={_id}
            value={deal.priority || ''}
            variant="table"
            badge={false}
          />
        </PanelField>
        <PanelField icon={IconLabel} label={t('labels')}>
          <div className="[&_.-ml-1]:ml-0!">
            <SelectLabels.FilterBar
              filterKey=""
              mode="multiple"
              variant="table"
              showLabels
              pipelineId={deal.pipelineId || deal.pipeline?._id || undefined}
              targetId={_id}
              initialValue={
                deal.labels
                  ?.filter(isDefined)
                  .map((label) => label._id || '') || []
              }
            />
          </div>
        </PanelField>
      </DealDetailSection>
      <DealDetailSection title={t('schedule')} nested>
        <PanelField icon={IconCalendar} label={t('start-date')}>
          <DateSelectDeal
            value={deal.startDate}
            id={_id}
            type="startDate"
            placeholder={t('start-date')}
          />
        </PanelField>
        <PanelField icon={IconCalendarDue} label={t('close-date')}>
          <DateSelectDeal
            value={deal.closeDate}
            id={_id}
            type="closeDate"
            placeholder={t('close-date')}
          />
        </PanelField>
      </DealDetailSection>
      <DealDetailSection title={t('organization')} nested>
        <DealPanelBroker deal={deal} />
        <PanelField icon={IconGitBranch} label={t('branch')}>
          <DealPanelBranchesCell
            value={branches.value}
            onValueChange={(value) => branches.setValue(toList(value))}
          />
        </PanelField>
        <PanelField icon={IconBuildingSkyscraper} label={t('department')}>
          <DealPanelDepartmentsCell
            value={departments.value}
            onValueChange={(value) => departments.setValue(toList(value))}
          />
        </PanelField>
      </DealDetailSection>
      <DealPanelTags deal={deal} />
      <DealDetailSection title={t('customers')}>
        <DealContactsField
          dealId={_id}
          kind="customer"
          variant="inline"
          label={t('customers')}
          value={deal.customers?.[0]?._id}
        />
      </DealDetailSection>
      <DealDetailSection title={t('companies')}>
        <DealContactsField
          dealId={_id}
          kind="company"
          variant="inline"
          label={t('companies')}
          value={deal.companies?.[0]?._id}
        />
      </DealDetailSection>
    </div>
  );
};

const DealPanelOverview = ({ deal }: { deal: IDealDetail }) => {
  const { t } = useTranslation('sales');
  const { editDeals } = useDealsEdit();
  const [newChecklistId, setNewChecklistId] = useState<string>();
  const { _id } = deal;
  const initialAttachments = useDealAttachments(deal);

  return (
    <AttachmentProvider dealId={_id} initialAttachments={initialAttachments}>
      <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
        <div className="grid gap-5 p-3 @3xl/record-panel:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] @3xl/record-panel:p-6">
          <DealFields deal={deal} />
          <div className="flex min-w-0 flex-col gap-2 border-t pt-4 @3xl/record-panel:border-t-0 @3xl/record-panel:pt-0">
            <div className="flex flex-wrap items-center gap-2">
              <ChecklistOverview onCreated={setNewChecklistId} />
              <AttachmentUploader />
            </div>
            <Attachments compact />
            <div className="pt-2">
              <Checklists
                dealId={_id}
                stageId={deal.stageId ?? undefined}
                newChecklistId={newChecklistId}
                compact
              />
            </div>
            <PanelDescriptionField
              key={_id}
              label={t('description')}
              value={deal.description || ''}
              scope={`${DEAL_PANEL_SCOPE}.description`}
              onSave={(description) =>
                editDeals({ variables: { _id, description } })
              }
            />
          </div>
        </div>
      </ScrollArea>
    </AttachmentProvider>
  );
};

export const DealPanelDetail = ({ dealId }: { dealId: string }) => (
  <DealPanelLoader dealId={dealId}>
    {(deal) => (
      <DealIdProvider value={dealId}>
        <DealsProvider>
          <DealPanelOverview deal={deal} />
        </DealsProvider>
      </DealIdProvider>
    )}
  </DealPanelLoader>
);
