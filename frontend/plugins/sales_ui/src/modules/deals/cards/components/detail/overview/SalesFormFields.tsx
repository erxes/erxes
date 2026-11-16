import {
  DealAssigneeChip,
  DealBranchesChip,
  DealBrokerTypeChip,
  DealCompanyChip,
  DealCustomerChip,
  DealDepartmentsChip,
  DealTagsChip,
} from '@/deals/components/deal-selects/DealDetailChips';
import {
  areIdListsEqual,
  rejectOnMutationError,
  useOptimisticField,
} from '@/deals/components/deal-selects/hooks/useOptimisticField';
import { Editor, isDefined, Separator } from 'erxes-ui';
import { ReactNode, useCallback, useRef, useState } from 'react';

import { SelectLabels } from '@/deals/components/common/filters/SelectLabel';
import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { DealContactsField } from '@/deals/components/deal-selects/DealContactsField';
import { SelectDealPriority } from '@/deals/components/deal-selects/SelectDealPriority';
import { SelectDealStage } from '@/deals/components/deal-selects/SelectDealStage';
import { useDealsContext } from '@/deals/context/DealContext';
import { IDealDetail } from '@/deals/types/deals';
import { useTranslation } from 'react-i18next';
import { AttachmentUploader } from './attachments/AttachmentUploader';
import { Attachments } from './attachments/Attachments';
import { ChecklistOverview } from './checklist/ChecklistOverview';
import { Checklists } from './checklist/Checklists';

const ARRAY_KEYS = new Set([
  'assignedUserIds',
  'tagIds',
  'branchIds',
  'departmentIds',
]);

type BrokerType = NonNullable<IDealDetail['brokerType']> | '';

interface BrokerSelection {
  id: string;
  type: BrokerType;
}

const normalizeMultiValue = (value: string | string[]) =>
  Array.isArray(value) ? value : [value];

const normalizeSingleValue = (value: string | string[]) =>
  Array.isArray(value) ? value[0] || '' : value;

const normalizeBrokerType = (value: string): BrokerType => {
  if (value === 'customer' || value === 'company' || value === 'user') {
    return value;
  }

  return '';
};

const areBrokerSelectionsEqual = (
  left: BrokerSelection,
  right: BrokerSelection,
) => left.id === right.id && left.type === right.type;

// One labelled group of field chips in the panel layout.
const FieldGroup = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col items-start gap-2">
    <span className="text-xs font-medium text-muted-foreground">{label}</span>
    {children}
  </div>
);

type TSalesFormFieldsProps = {
  deal: IDealDetail;
  // The deal's fields, its work (checklists, files, description), or both.
  parts?: 'all' | 'fields' | 'work';
  // Fields as wrapping rows (bar) or grouped one under another (panel).
  layout?: 'bar' | 'panel';
};

export const SalesFormFields = ({
  deal,
  parts = 'all',
  layout = 'bar',
}: TSalesFormFieldsProps) => {
  const { editDeals } = useDealsContext();
  const [newChecklistId, setNewChecklistId] = useState<string>();
  const descriptionRef = useRef<string | undefined>(undefined);
  const lastSavedDescriptionRef = useRef<string | undefined>(
    deal.description ?? undefined,
  );

  const { t } = useTranslation('sales');
  const {
    startDate,
    closeDate,
    _id,
    assignedUserIds,
    labels,
    priority,
    tagIds,
    branchIds,
    departmentIds,
    brokerType,
    brokerId,
  } = deal;

  const handleChange = useCallback(
    (key: string, value: string | string[]) => {
      return editDeals({
        variables: {
          _id: deal._id,
          [key]: ARRAY_KEYS.has(key) && !Array.isArray(value) ? [value] : value,
        },
      });
    },
    [deal._id, editDeals],
  );

  const optimisticAssignedUsers = useOptimisticField({
    value: assignedUserIds?.filter(isDefined) || [],
    resetKey: _id,
    isEqual: areIdListsEqual,
    onCommit: (value) =>
      rejectOnMutationError(handleChange('assignedUserIds', value)),
  });
  const optimisticTags = useOptimisticField({
    value: tagIds?.filter(isDefined) || [],
    resetKey: _id,
    isEqual: areIdListsEqual,
    onCommit: (value) => rejectOnMutationError(handleChange('tagIds', value)),
  });
  const optimisticBranches = useOptimisticField({
    value: branchIds?.filter(isDefined) || [],
    resetKey: _id,
    isEqual: areIdListsEqual,
    onCommit: (value) =>
      rejectOnMutationError(handleChange('branchIds', value)),
  });
  const optimisticDepartments = useOptimisticField({
    value: departmentIds?.filter(isDefined) || [],
    resetKey: _id,
    isEqual: areIdListsEqual,
    onCommit: (value) =>
      rejectOnMutationError(handleChange('departmentIds', value)),
  });
  const optimisticBroker = useOptimisticField<BrokerSelection>({
    value: {
      id: brokerId || '',
      type: brokerType || '',
    },
    resetKey: _id,
    isEqual: areBrokerSelectionsEqual,
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

  const stageField = <SelectDealStage deal={deal} />;
  const startDateField = (
    <DateSelectDeal
      value={startDate}
      id={_id}
      type="startDate"
      variant="input"
      placeholder={t('start-date')}
      label={t('start-date')}
    />
  );
  const closeDateField = (
    <DateSelectDeal
      value={closeDate}
      id={_id}
      type="closeDate"
      variant="input"
      placeholder={t('close-date')}
      label={t('close-date')}
    />
  );
  const assigneesField = (
    <DealAssigneeChip
      value={optimisticAssignedUsers.value}
      onValueChange={(value) =>
        optimisticAssignedUsers.setValue(normalizeMultiValue(value))
      }
      placeholder={t('assigned-to')}
    />
  );
  const priorityField = (
    <SelectDealPriority dealId={_id} value={priority || ''} variant="detail" />
  );
  const brokerFields = (
    <>
      {optimisticBroker.value.type === 'customer' && (
        <DealCustomerChip
          value={optimisticBroker.value.id}
          placeholder={t('select-broker', 'Select broker')}
          onValueChange={(value) =>
            optimisticBroker.setValue({
              ...optimisticBroker.value,
              id: normalizeSingleValue(value),
            })
          }
        />
      )}
      {optimisticBroker.value.type === 'company' && (
        <DealCompanyChip
          value={optimisticBroker.value.id}
          placeholder={t('select-broker', 'Select broker')}
          onValueChange={(value) =>
            optimisticBroker.setValue({
              ...optimisticBroker.value,
              id: normalizeSingleValue(value),
            })
          }
        />
      )}
      {optimisticBroker.value.type === 'user' && (
        <DealAssigneeChip
          mode="single"
          label={t('user')}
          value={optimisticBroker.value.id}
          placeholder={t('select-broker', 'Select broker')}
          onValueChange={(value) =>
            optimisticBroker.setValue({
              ...optimisticBroker.value,
              id: normalizeSingleValue(value),
            })
          }
        />
      )}
      <DealBrokerTypeChip
        value={optimisticBroker.value.type || '_none'}
        options={[
          { value: '_none', label: t('none') },
          { value: 'customer', label: t('customer') },
          { value: 'company', label: t('company') },
          { value: 'user', label: t('user') },
        ]}
        onValueChange={(value) =>
          optimisticBroker.setValue({
            id: '',
            type: normalizeBrokerType(value),
          })
        }
      />
    </>
  );
  const branchesField = (
    <DealBranchesChip
      value={optimisticBranches.value}
      onValueChange={(value) =>
        optimisticBranches.setValue(normalizeMultiValue(value))
      }
    />
  );
  const departmentsField = (
    <DealDepartmentsChip
      value={optimisticDepartments.value}
      onValueChange={(value) =>
        optimisticDepartments.setValue(normalizeMultiValue(value))
      }
    />
  );
  const labelsField = (
    <SelectLabels.FilterBar
      filterKey=""
      mode="multiple"
      variant="detail"
      targetId={_id}
      initialValue={
        labels?.filter(isDefined).map((label) => label._id || '') || []
      }
    />
  );
  const tagsField = (
    <DealTagsChip
      value={optimisticTags.value}
      showSelectedTagsOutside={false}
      onValueChange={(value) =>
        optimisticTags.setValue(normalizeMultiValue(value))
      }
    />
  );
  const customerField = (
    <DealContactsField
      dealId={_id}
      kind="customer"
      value={deal.customers?.[0]?._id}
      label={t('customers', 'Customers')}
    />
  );
  const companyField = (
    <DealContactsField
      dealId={_id}
      kind="company"
      value={deal.companies?.[0]?._id}
      label={t('companies', 'Companies')}
    />
  );

  const fields =
    layout === 'panel' ? (
      <div className="flex flex-col gap-4">
        <FieldGroup label={t('stage')}>{stageField}</FieldGroup>
        <FieldGroup label={t('deal-group-people')}>
          {customerField}
          {companyField}
          {assigneesField}
          {brokerFields}
        </FieldGroup>
        <FieldGroup label={t('deal-group-dates')}>
          {startDateField}
          {closeDateField}
        </FieldGroup>
        <FieldGroup label={t('deal-group-classification')}>
          {priorityField}
          {labelsField}
          {tagsField}
        </FieldGroup>
        <FieldGroup label={t('deal-group-organization')}>
          {branchesField}
          {departmentsField}
        </FieldGroup>
      </div>
    ) : (
      <>
        <div className="flex flex-wrap items-center gap-2">
          {stageField}
          {startDateField}
          {closeDateField}
          {assigneesField}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {priorityField}
          {brokerFields}
          {branchesField}
          {departmentsField}
          {labelsField}
          {tagsField}
          {customerField}
          {companyField}
        </div>
      </>
    );

  const workActions = (
    <div className="flex flex-wrap items-center gap-2">
      <ChecklistOverview onCreated={setNewChecklistId} />
      <AttachmentUploader />
    </div>
  );

  const work = (
    <>
      <Attachments />
      <Separator className="mt-4" />
      <Checklists
        dealId={_id}
        stageId={deal.stageId ?? undefined}
        newChecklistId={newChecklistId}
      />
      <div
        className="min-h-56 overflow-y-auto"
        onBlur={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          const next = descriptionRef.current;
          if (next === undefined || next === lastSavedDescriptionRef.current) {
            return;
          }
          lastSavedDescriptionRef.current = next;
          handleChange('description', next);
        }}
      >
        <Editor
          initialContent={deal.description || ''}
          onChange={(content) => {
            descriptionRef.current = content;
          }}
          className="min-h-full h-auto shadow-none"
        />
      </div>
    </>
  );

  if (parts === 'fields') {
    return fields;
  }

  if (parts === 'work') {
    return (
      <>
        {workActions}
        {work}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {fields}
        {workActions}
      </div>
      {work}
    </>
  );
};
