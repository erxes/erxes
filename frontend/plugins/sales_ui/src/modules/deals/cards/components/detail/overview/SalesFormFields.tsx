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

const ARRAY_KEYS = new Set([
  'assignedUserIds',
  'tagIds',
  'branchIds',
  'departmentIds',
]);

export const SalesFormFields = ({ deal }: { deal: IDeal }) => {
  const { editDeals } = useDealsContext();
  const descriptionRef = useRef<string | undefined>(undefined);
  const lastSavedDescriptionRef = useRef<string | undefined>(deal.description);

  const { t } = useTranslation('sales');

  const handleChange = useCallback(
    (key: string, value: string | string[] | undefined | null) => {
      if (value == null) return;
      editDeals({
        variables: {
          _id: deal._id,
          [key]: ARRAY_KEYS.has(key) && !Array.isArray(value) ? [value] : value,
        },
      });
    },
    [deal._id, editDeals],
  );

  const handleBrokerTypeChange = useCallback(
    (type: string) => {
      // Changing the type invalidates the broker, but re-picking the same type
      // must not wipe an already chosen one.
      if (type === (deal.brokerType || '')) return;

      editDeals({
        variables: {
          _id: deal._id,
          brokerType: type || null,
          brokerId: null,
        },
      });
    },
    [deal._id, deal.brokerType, editDeals],
  );

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
          value={assignedUserIds}
          onValueChange={(value) => handleChange('assignedUserIds', value)}
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
          label={t('by-label')}
          variant="detail"
          targetId={_id}
          initialValue={labels?.map((label) => label._id || '') || []}
        />
        {labels?.map((label) => (
          <div
            key={label._id}
            className="inline-flex items-center h-7 px-2 text-xs font-medium text-white rounded"
            style={{ backgroundColor: label.colorCode }}
          >
            {label.name}
          </div>
        ))}
        <DealTagsChip
          value={tagIds}
          onValueChange={(value) => handleChange('tagIds', value)}
        />
        <DealBranchesChip
          value={branchIds}
          onValueChange={(value) => handleChange('branchIds', value)}
        />
        <DealDepartmentsChip
          value={departmentIds}
          onValueChange={(value) => handleChange('departmentIds', value)}
        />
        <DealBrokerTypeChip
          value={brokerType || '_none'}
          options={[
            { value: '_none', label: t('none') },
            { value: 'customer', label: t('customer') },
            { value: 'company', label: t('company') },
            { value: 'user', label: t('user') },
          ]}
          onValueChange={(v) => handleBrokerTypeChange(v === '_none' ? '' : v)}
        />
        {brokerType === 'customer' && (
          <DealCustomerChip
            value={brokerId || ''}
            onValueChange={(value) => handleChange('brokerId', value)}
          />
        )}
        {brokerType === 'company' && (
          <DealCompanyChip
            value={brokerId || ''}
            onValueChange={(value) => handleChange('brokerId', value)}
          />
        )}
        {brokerType === 'user' && (
          <DealAssigneeChip
            mode="single"
            value={brokerId || ''}
            onValueChange={(value) => handleChange('brokerId', value)}
          />
        )}
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
          // Every blur used to re-send the same body, which logged a duplicate
          // "changed description" row each time the editor lost focus.
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
