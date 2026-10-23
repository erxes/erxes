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
import { useCallback, useRef, useState } from 'react';

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

export const SalesFormFields = ({ deal }: { deal: IDealDetail }) => {
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

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <SelectDealStage deal={deal} />
          <DateSelectDeal
            value={startDate}
            id={_id}
            type="startDate"
            variant="input"
            placeholder={t('start-date')}
            label={t('start-date')}
          />
          <DateSelectDeal
            value={closeDate}
            id={_id}
            type="closeDate"
            variant="input"
            placeholder={t('close-date')}
            label={t('close-date')}
          />
          <DealAssigneeChip
            value={optimisticAssignedUsers.value}
            onValueChange={(value) =>
              optimisticAssignedUsers.setValue(normalizeMultiValue(value))
            }
            placeholder={t('assigned-to')}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SelectDealPriority
            dealId={_id}
            value={priority || ''}
            variant="detail"
          />
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
          <DealBranchesChip
            value={optimisticBranches.value}
            onValueChange={(value) =>
              optimisticBranches.setValue(normalizeMultiValue(value))
            }
          />
          <DealDepartmentsChip
            value={optimisticDepartments.value}
            onValueChange={(value) =>
              optimisticDepartments.setValue(normalizeMultiValue(value))
            }
          />
          <SelectLabels.FilterBar
            filterKey=""
            mode="multiple"
            variant="detail"
            targetId={_id}
            initialValue={
              labels?.filter(isDefined).map((label) => label._id || '') || []
            }
          />
          <DealTagsChip
            value={optimisticTags.value}
            showSelectedTagsOutside={false}
            onValueChange={(value) =>
              optimisticTags.setValue(normalizeMultiValue(value))
            }
          />
          <DealContactsField
            dealId={_id}
            kind="customer"
            value={deal.customers?.[0]?._id}
            label={t('customers', 'Customers')}
          />
          <DealContactsField
            dealId={_id}
            kind="company"
            value={deal.companies?.[0]?._id}
            label={t('companies', 'Companies')}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ChecklistOverview onCreated={setNewChecklistId} />
          <AttachmentUploader />
        </div>
      </div>
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
};
