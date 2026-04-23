import React from 'react';
import { Button } from 'erxes-ui';

import SelectBranches from '../selects/SelectBranches';
import SelectDepartments from '../selects/SelectDepartments';

type Props = {
  condition: any;
  onChange: (id: string, condition: any) => void;
  onRemove: (id: string) => void;
  onAddCondition?: () => void;
};

const PerPrintConditions = ({ condition, onChange, onRemove }: Props) => {
  const onChangeConfig = (key: string, value: any) => {
    onChange(condition.id, { ...condition, [key]: value });
  };

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1 grid grid-cols-2 gap-3">
        <div>
          <SelectBranches
            value={condition.branchId || ''}
            onChange={(branchId) => onChangeConfig('branchId', branchId)}
          />
        </div>
        <div>
          <SelectDepartments
            value={condition.departmentId || ''}
            onChange={(departmentId) =>
              onChangeConfig('departmentId', departmentId)
            }
          />
        </div>
      </div>
      <div className="flex gap-2 h-8">
        <Button
          type="button"
          className="h-8"
          variant="outline"
          size="sm"
          onClick={() => onRemove(condition.id)}
        >
          ✕ Delete Condition
        </Button>
      </div>
    </div>
  );
};

export default PerPrintConditions;
