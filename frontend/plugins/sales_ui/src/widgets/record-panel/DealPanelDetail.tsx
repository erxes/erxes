import { AttachmentProvider } from '@/deals/cards/components/detail/overview/attachments/AttachmentContext';
import { AttachmentUploader } from '@/deals/cards/components/detail/overview/attachments/AttachmentUploader';
import { Attachments } from '@/deals/cards/components/detail/overview/attachments/Attachments';
import { ChecklistOverview } from '@/deals/cards/components/detail/overview/checklist/ChecklistOverview';
import { Checklists } from '@/deals/cards/components/detail/overview/checklist/Checklists';
import { useDealDetail, useDealsEdit } from '@/deals/cards/hooks/useDeals';
import { SelectLabels } from '@/deals/components/common/filters/SelectLabel';
import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { DealContactsField } from '@/deals/components/deal-selects/DealContactsField';
import {
  areIdListsEqual,
  rejectOnMutationError,
  useOptimisticField,
} from '@/deals/components/deal-selects/hooks/useOptimisticField';
import { SelectDealPriority } from '@/deals/components/deal-selects/SelectDealPriority';
import { DealsProvider } from '@/deals/context/DealContext';
import { DealIdProvider } from '@/deals/context/DealIdContext';
import { IDealDetail } from '@/deals/types/deals';
import {
  IconAlignLeft,
  IconBriefcase,
  IconBuilding,
  IconBuildingSkyscraper,
  IconCalendar,
  IconCalendarDue,
  IconFlag,
  IconGitBranch,
  IconLabel,
  IconTags,
  IconUser,
  IconUsers,
} from '@tabler/icons-react';
import {
  CopyText,
  Empty,
  isDefined,
  ScrollArea,
  Spinner,
  TextField,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PANEL_TEXT_FIELD_CLASS_NAME,
  PanelDescriptionField,
  PanelField,
} from 'ui-modules';
import {
  DealPanelBranchesCell,
  DealPanelCompanyCell,
  DealPanelCustomerCell,
  DealPanelDepartmentsCell,
  DealPanelMemberCell,
  DealPanelOptionCell,
  DealPanelTagsCell,
} from '~/widgets/record-panel/DealPanelCells';
import { DealPanelStage } from '~/widgets/record-panel/DealPanelStage';

const SCOPE = 'side-panel-deal';

type BrokerType = NonNullable<IDealDetail['brokerType']> | '';

interface BrokerSelection {
  id: string;
  type: BrokerType;
}

const toList = (value: string | string[]) =>
  Array.isArray(value) ? value : [value];

const toSingle = (value: string | string[]) =>
  Array.isArray(value) ? value[0] || '' : value;

const toBrokerType = (value: string): BrokerType =>
  value === 'customer' || value === 'company' || value === 'user' ? value : '';

const useListField = (
  deal: IDealDetail,
  key: 'assignedUserIds' | 'tagIds' | 'branchIds' | 'departmentIds',
) => {
  const { editDeals } = useDealsEdit();

  return useOptimisticField({
    value: deal[key]?.filter(isDefined) || [],
    resetKey: deal._id,
    isEqual: areIdListsEqual,
    onCommit: (value) =>
      rejectOnMutationError(
        editDeals({ variables: { _id: deal._id, [key]: value } }),
      ),
  });
};

const DealPanelBroker = ({ deal }: { deal: IDealDetail }) => {
  const { t } = useTranslation('sales');
  const { editDeals } = useDealsEdit();
  const broker = useOptimisticField<BrokerSelection>({
    value: { id: deal.brokerId || '', type: deal.brokerType || '' },
    resetKey: deal._id,
    isEqual: (left, right) => left.id === right.id && left.type === right.type,
    onCommit: (value) =>
      rejectOnMutationError(
        editDeals({
          variables: {
            _id: deal._id,
            brokerType: value.type || null,
            brokerId: value.id || null,
          },
        }),
      ),
  });
  const setBrokerId = (value: string | string[]) =>
    broker.setValue({ ...broker.value, id: toSingle(value) });
  const placeholder = t('select-broker');

  return (
    <>
      <PanelField icon={IconBriefcase} label={t('broker')}>
        <DealPanelOptionCell
          value={broker.value.type || '_none'}
          options={[
            { value: '_none', label: t('none') },
            { value: 'customer', label: t('customer') },
            { value: 'company', label: t('company') },
            { value: 'user', label: t('user') },
          ]}
          onValueChange={(value) =>
            broker.setValue({ id: '', type: toBrokerType(value) })
          }
        />
      </PanelField>
      {broker.value.type === 'customer' && (
        <PanelField icon={IconUsers} label={t('customer')}>
          <DealPanelCustomerCell
            value={broker.value.id}
            placeholder={placeholder}
            onValueChange={setBrokerId}
          />
        </PanelField>
      )}
      {broker.value.type === 'company' && (
        <PanelField icon={IconBuilding} label={t('company')}>
          <DealPanelCompanyCell
            value={broker.value.id}
            placeholder={placeholder}
            onValueChange={setBrokerId}
          />
        </PanelField>
      )}
      {broker.value.type === 'user' && (
        <PanelField icon={IconUser} label={t('user')}>
          <DealPanelMemberCell
            mode="single"
            value={broker.value.id}
            placeholder={placeholder}
            onValueChange={setBrokerId}
          />
        </PanelField>
      )}
    </>
  );
};

const DealPanelOverview = ({ deal }: { deal: IDealDetail }) => {
  const { t } = useTranslation('sales');
  const { editDeals } = useDealsEdit();
  const [newChecklistId, setNewChecklistId] = useState<string>();
  const { _id } = deal;
  const assignees = useListField(deal, 'assignedUserIds');
  const tags = useListField(deal, 'tagIds');
  const branches = useListField(deal, 'branchIds');
  const departments = useListField(deal, 'departmentIds');
  const initialAttachments = useMemo(
    () => deal.attachments?.filter(isDefined) ?? [],
    [deal.attachments],
  );

  return (
    <AttachmentProvider dealId={_id} initialAttachments={initialAttachments}>
      <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
        <div className="grid gap-5 p-3 @3xl/record-panel:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] @3xl/record-panel:p-6">
          <div className="flex min-w-0 flex-col gap-1">
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
            <PanelField icon={IconAlignLeft} label={t('name')}>
              <TextField
                scope={`${SCOPE}.name`}
                value={deal.name || ''}
                placeholder={t('deal-name')}
                className={PANEL_TEXT_FIELD_CLASS_NAME}
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
                  pipelineId={
                    deal.pipelineId || deal.pipeline?._id || undefined
                  }
                  targetId={_id}
                  initialValue={
                    deal.labels
                      ?.filter(isDefined)
                      .map((label) => label._id || '') || []
                  }
                />
              </div>
            </PanelField>
            <PanelField icon={IconTags} label={t('tags')}>
              <DealPanelTagsCell
                value={tags.value}
                placeholder={t('select-tags')}
                onValueChange={(value) => tags.setValue(toList(value))}
              />
            </PanelField>
            <PanelField icon={IconUsers} label={t('customers')}>
              <DealContactsField
                dealId={_id}
                kind="customer"
                variant="inline"
                label={t('customers')}
                value={deal.customers?.[0]?._id}
              />
            </PanelField>
            <PanelField icon={IconBuilding} label={t('companies')}>
              <DealContactsField
                dealId={_id}
                kind="company"
                variant="inline"
                label={t('companies')}
                value={deal.companies?.[0]?._id}
              />
            </PanelField>
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
          </div>
          <div className="flex min-w-0 flex-col gap-2">
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
              scope={`${SCOPE}.description`}
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

export const DealPanelDetail = ({ dealId }: { dealId: string }) => {
  const { t } = useTranslation('sales');
  const { deal, loading } = useDealDetail(
    { variables: { _id: dealId }, fetchPolicy: 'cache-first' },
    { subscribe: false },
  );

  if (loading && !deal) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!deal) {
    return (
      <Empty className="py-12">
        <Empty.Header>
          <Empty.Title>{t('deal-not-found')}</Empty.Title>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <DealIdProvider value={dealId}>
      <DealsProvider>
        <DealPanelOverview deal={deal} />
      </DealsProvider>
    </DealIdProvider>
  );
};
