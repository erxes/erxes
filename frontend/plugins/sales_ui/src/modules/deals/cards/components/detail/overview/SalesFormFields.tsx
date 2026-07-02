import { useRef, useCallback } from 'react';
import { Label, Editor } from 'erxes-ui';
import {
  SelectBranches,
  SelectDepartments,
  SelectMember,
  SelectTags,
} from 'ui-modules';
import { DateSelectDeal } from '@/deals/components/deal-selects/DateSelectDeal';
import { SelectLabels } from '@/deals/components/common/filters/SelectLabel';
import { SelectDealPriority } from '@/deals/components/deal-selects/SelectDealPriority';
import { IDeal } from '@/deals/types/deals';
import { useDealsContext } from '@/deals/context/DealContext';
import { useTranslation } from 'react-i18next';

const ARRAY_KEYS = new Set(['assignedUserIds', 'tagIds', 'branchIds', 'departmentIds']);

const FormField = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {children}
  </div>
);

export const SalesFormFields = ({ deal }: { deal: IDeal }) => {
  const { editDeals } = useDealsContext();
  const descriptionRef = useRef<string | undefined>(undefined);

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
  } = deal;

  return (
    <>
      <div className="grid grid-cols-2 gap-4 py-4">
        <FormField label={t('due-date')}>  
          <div className="flex items-center">
            <DateSelectDeal
              value={startDate}
              id={_id}
              type="startDate"
              variant="button"
            />
            <span className="mx-2">{t('date-range-to')}</span>
            <DateSelectDeal
              value={closeDate}
              id={_id}
              type="closeDate"
              variant="button"
            />
          </div>
        </FormField>
        <FormField label={t('assigned-to')}>  
          <SelectMember
            value={assignedUserIds}
            onValueChange={(value) => handleChange('assignedUserIds', value)}
            className="text-foreground"
            mode="multiple"
          />
        </FormField>
        <FormField label={t('label')}>  
          <div className="flex flex-wrap items-center gap-1">
            <SelectLabels.FilterBar
              filterKey=""
              mode="multiple"
              label={t('by-label')}
              variant="card"
              targetId={_id}
              initialValue={labels?.map((label) => label._id || '') || []}
            />
            {labels?.map((label) => (
              <div
                key={label._id}
                className="inline-block py-1 pl-2 pr-2 ml-1 text-sm font-medium text-white rounded"
                style={{ backgroundColor: label.colorCode }}
              >
                {label.name}
              </div>
            ))}
          </div>
        </FormField>
        <FormField label={t('priority')}>  
          <div>
            <SelectDealPriority dealId={_id} value={priority || ''} variant="card" />
          </div>
        </FormField>
        <FormField label={t('tags')}>  
          <SelectTags
            tagType="sales:deal"
            mode="multiple"
            value={tagIds}
            onValueChange={(value) => handleChange('tagIds', value)}
          />
        </FormField>
        <FormField label={t('branches')}>  
          <SelectBranches.ComboboxItem
            value={branchIds}
            onValueChange={(value) => handleChange('branchIds', value)}
            mode="multiple"
          />
        </FormField>
        <FormField label={t('departments')}>  
          <SelectDepartments.ComboboxItem
            mode="multiple"
            value={departmentIds}
            onValueChange={(value) => handleChange('departmentIds', value)}
          />
        </FormField>
      </div>
      <div
        className="space-y-2"
        onBlur={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          if (descriptionRef.current !== undefined) {
            handleChange('description', descriptionRef.current);
          }
        }}
      >
        <Label>{t('description')}</Label>
        <Editor
          initialContent={deal.description || ''}
          onChange={(content) => {
            descriptionRef.current = content;
          }}
          className="overflow-y-auto h-28"
        />
      </div>
    </>
  );
};
