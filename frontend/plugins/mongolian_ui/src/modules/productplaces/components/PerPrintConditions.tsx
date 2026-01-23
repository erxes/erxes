import React from 'react';
import { Button } from 'erxes-ui';

import SelectBranches from '../selects/SelectBranches';
import SelectDepartments from '../selects/SelectDepartments';

type Props = {
  condition: any;
  onChange: (id: string, condition: any) => void;
  onRemove: (id: string) => void;
};

const PerPrintConditions = ({ condition, onChange, onRemove }: Props) => {
  const onChangeConfig = (key: string, value: any) => {
    onChange(condition.id, { ...condition, [key]: value });
  };

  return (
    <div className="flex items-end gap-3">
      {/* Branch */}
      <div className="space-y-1">
        <SelectBranches
          value={condition.branchId || ''}
          onChange={(branchId) => onChangeConfig('branchId', branchId)}
        />
      </div>

      {/* Department */}
      <div className="space-y-1">
        <SelectDepartments
          value={condition.departmentId || ''}
          onChange={(departmentId) => onChangeConfig('departmentId', departmentId)}
        />
      </div>

      {/* Remove */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(condition.id)}
      >
        ✕
      </Button>
    </div>
  );
};

export default PerPrintConditions;