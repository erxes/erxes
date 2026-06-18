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
        <FormField label="Due date">
          <div className="flex items-center">
            <DateSelectDeal
              value={startDate}
              id={_id}
              type="startDate"
              variant="button"
            />
            <span className="mx-2">to</span>
            <DateSelectDeal
              value={closeDate}
              id={_id}
              type="closeDate"
              variant="button"
            />
          </div>
        </FormField>
        <FormField label="Assigned to">
          <SelectMember
            value={assignedUserIds}
            onValueChange={(value) => handleChange('assignedUserIds', value)}
            className="text-foreground"
            mode="multiple"
          />
        </FormField>
        <FormField label="Label">
          <div className="flex flex-wrap items-center gap-1">
            <SelectLabels.FilterBar
              filterKey=""
              mode="multiple"
              label="By Label"
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
        <FormField label="Priority">
          <div>
            <SelectDealPriority dealId={_id} value={priority || ''} variant="card" />
          </div>
        </FormField>
        <FormField label="Tags">
          <SelectTags
            tagType="sales:deal"
            mode="multiple"
            value={tagIds}
            onValueChange={(value) => handleChange('tagIds', value)}
          />
        </FormField>
        <FormField label="Branches">
          <SelectBranches.ComboboxItem
            value={branchIds}
            onValueChange={(value) => handleChange('branchIds', value)}
            mode="multiple"
          />
        </FormField>
        <FormField label="Departments">
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
        <Label>Description</Label>
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
