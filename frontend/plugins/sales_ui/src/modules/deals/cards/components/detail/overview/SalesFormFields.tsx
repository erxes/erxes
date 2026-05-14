import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
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

  const [descriptionContent, setDescriptionContent] = useState<
    string | undefined
  >(undefined);
  const [debouncedDescription] = useDebounce(descriptionContent, 1000);

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

  useEffect(() => {
    if (debouncedDescription !== undefined) {
      handleDealFieldChange('description', debouncedDescription);
    }
  }, [debouncedDescription, handleDealFieldChange]);

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
                className="ml-1 pl-2 pr-2 py-1 rounded text-white text-sm font-medium inline-block"
                style={{ backgroundColor: label.colorCode }}
              >
                {label.name}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2 flex-col">
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
      <div className="space-y-2">
        <Label>Description</Label>
        <Editor
          initialContent={deal.description || []}
          onChange={(content) => {
            setDescriptionContent(content);
          }}
          className="h-28 overflow-y-auto"
        />
      </div>
    </>
  );
};
