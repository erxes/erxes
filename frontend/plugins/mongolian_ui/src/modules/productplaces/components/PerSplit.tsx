import React from 'react';
import { Button } from 'erxes-ui'; // Removed Select import

type Props = {
  split: any;
  onChange: (id: string, split: any) => void;
  onRemove: (id: string) => void;
};

const PerSplit = ({ split, onChange, onRemove }: Props) => {
  const onChangeConfig = (key: string, value: any) => {
    onChange(split.id, { ...split, [key]: value });
  };

  return (
    <div className="rounded border p-4 space-y-6 bg-white">
      {/* SPLIT RULE */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Split by</label>
            <select
              className="w-full p-2 border rounded"
              value={split.by || ''}
              onChange={(e) => onChangeConfig('by', e.target.value)}
            >
              <option value="">Choose field</option>
              <option value="amount">Amount</option>
              <option value="quantity">Quantity</option>
              <option value="category">Category</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Operator</label>
            <select
              className="w-full p-2 border rounded"
              value={split.operator || ''}
              onChange={(e) => onChangeConfig('operator', e.target.value)}
            >
              <option value="">Choose operator</option>
              <option value="equals">Equals</option>
              <option value="greater">Greater than</option>
              <option value="less">Less than</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Value</label>
            <input
              className="w-full p-2 border rounded"
              value={split.value || ''}
              onChange={(e) => onChangeConfig('value', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(split.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default PerSplit;