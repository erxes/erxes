import { useRef, useCallback } from 'react';
import { Editor, Separator } from 'erxes-ui';
import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import {
  DealAssigneeChip,
  DealBranchesChip,
  DealBrokerTypeChip,
  DealCompanyChip,
  DealCustomerChip,
  DealDepartmentsChip,
  DealTagsChip,
} from '@/deals/components/deal-selects/DealDetailChips';
import { SelectLabels } from '@/deals/components/common/filters/SelectLabel';
import { SelectDealPriority } from '@/deals/components/deal-selects/SelectDealPriority';
import { SelectDealStage } from '@/deals/components/deal-selects/SelectDealStage';
import { IDeal } from '@/deals/types/deals';
import { useDealsContext } from '@/deals/context/DealContext';
import { useTranslation } from 'react-i18next';
import { AttachmentUploader } from './attachments/AttachmentUploader';
import { Attachments } from './attachments/Attachments';
import { DealsActions } from '@/deals/actionBar/components/DealsActions';
import {
  areIdListsEqual,
  rejectOnMutationError,
  useOptimisticField,
} from '@/deals/components/deal-selects/hooks/useOptimisticField';

const ARRAY_KEYS = new Set([
  'assignedUserIds',
  'tagIds',
  'branchIds',
  'departmentIds',
]);

type BrokerType = NonNullable<IDeal['brokerType']> | '';

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

export const SalesFormFields = ({ deal }: { deal: IDeal }) => {
  const { editDeals } = useDealsContext();
  const descriptionRef = useRef<string | undefined>(undefined);
  const lastSavedDescriptionRef = useRef<string | undefined>(deal.description);

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
    value: assignedUserIds || [],
    resetKey: _id,
    isEqual: areIdListsEqual,
    onCommit: (value) =>
      rejectOnMutationError(handleChange('assignedUserIds', value)),
  });
  const optimisticTags = useOptimisticField({
    value: tagIds || [],
    resetKey: _id,
    isEqual: areIdListsEqual,
    onCommit: (value) => rejectOnMutationError(handleChange('tagIds', value)),
  });
  const optimisticBranches = useOptimisticField({
    value: branchIds || [],
    resetKey: _id,
    isEqual: areIdListsEqual,
    onCommit: (value) =>
      rejectOnMutationError(handleChange('branchIds', value)),
  });
  const optimisticDepartments = useOptimisticField({
    value: departmentIds || [],
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
      <div className="flex flex-wrap items-center gap-2">
        <SelectDealStage deal={deal} />
        <SelectDealPriority
          dealId={_id}
          value={priority || ''}
          variant="detail"
        />
        <DealAssigneeChip
          value={optimisticAssignedUsers.value}
          onValueChange={(value) =>
            optimisticAssignedUsers.setValue(normalizeMultiValue(value))
          }
          placeholder={t('assigned-to')}
        />
        <DateSelectDeal
          value={startDate}
          id={_id}
          type="startDate"
          variant="detail"
          placeholder={t('start-date')}
        />
        <DateSelectDeal
          value={closeDate}
          id={_id}
          type="closeDate"
          variant="detail"
          placeholder={t('close-date')}
        />
        <SelectLabels.FilterBar
          filterKey=""
          mode="multiple"
          variant="detail"
          targetId={_id}
          initialValue={labels?.map((label) => label._id || '') || []}
        />
        <DealTagsChip
          value={optimisticTags.value}
          showSelectedTagsOutside={false}
          onValueChange={(value) =>
            optimisticTags.setValue(normalizeMultiValue(value))
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
        {optimisticBroker.value.type === 'customer' && (
          <DealCustomerChip
            value={optimisticBroker.value.id}
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
            value={optimisticBroker.value.id}
            onValueChange={(value) =>
              optimisticBroker.setValue({
                ...optimisticBroker.value,
                id: normalizeSingleValue(value),
              })
            }
          />
        )}
        <DealsActions deals={[deal]} variant="inline" />
      </div>
      <div className="flex">
        <AttachmentUploader />
      </div>
      <Attachments />
      <Separator className="mt-4" />
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
