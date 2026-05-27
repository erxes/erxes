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

export const SalesFormFields = ({ deal }: { deal: IDeal }) => {
  const { editDeals } = useDealsContext();

  const descriptionRef = useRef<string | undefined>(undefined);

  const handleDealFieldChange = useCallback(
    (key: string, value: string | string[] | undefined | null) => {
      if (value === undefined || value === null) return;

      const isArrayKey = [
        'assignedUserIds',
        'tagIds',
        'branchIds',
        'departmentIds',
      ].includes(key);

      const finalValue = isArrayKey && !Array.isArray(value) ? [value] : value;

      editDeals({
        variables: {
          _id: deal._id,
          [key]: finalValue,
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
        <div className="space-y-2">
          <Label>Due date</Label>
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
        </div>
        <div className="space-y-2">
          <Label>Assigned to</Label>
          <SelectMember
            value={assignedUserIds}
            onValueChange={(value) =>
              handleDealFieldChange('assignedUserIds', value)
            }
            className="text-foreground"
            mode="multiple"
          />
        </div>
        <div className="space-y-2">
          <Label>Label</Label>
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
        </div>
        <div className="flex-col space-y-2">
          <Label>Priority</Label>
          <div>
            <SelectDealPriority
              dealId={_id}
              value={priority || ''}
              variant="card"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Tags</Label>
          <SelectTags
            tagType="sales:deal"
            mode="multiple"
            value={tagIds}
            onValueChange={(value) => {
              handleDealFieldChange('tagIds', value);
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>Branches</Label>
          <SelectBranches.ComboboxItem
            value={branchIds}
            onValueChange={(value) => {
              handleDealFieldChange('branchIds', value);
            }}
            mode="multiple"
          />
        </div>
        <div className="space-y-2">
          <Label>Departments</Label>
          <SelectDepartments.ComboboxItem
            mode="multiple"
            value={departmentIds}
            onValueChange={(value) => {
              handleDealFieldChange('departmentIds', value);
            }}
          />
        </div>
      </div>
      <div
        className="space-y-2"
        onBlur={(e) => {
          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          if (descriptionRef.current !== undefined) {
            handleDealFieldChange('description', descriptionRef.current);
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