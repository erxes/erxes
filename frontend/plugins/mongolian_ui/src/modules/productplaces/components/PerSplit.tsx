import React from 'react';
import { Button, Select } from 'erxes-ui';

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
            <Select
              value={split.by || ''}
              onValueChange={(v) => onChangeConfig('by', v)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose field" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="amount">Amount</Select.Item>
                <Select.Item value="quantity">Quantity</Select.Item>
                <Select.Item value="category">Category</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Operator</label>
            <Select
              value={split.operator || ''}
              onValueChange={(v) => onChangeConfig('operator', v)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose operator" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="equals">Equals</Select.Item>
                <Select.Item value="greater">Greater than</Select.Item>
                <Select.Item value="less">Less than</Select.Item>
              </Select.Content>
            </Select>
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
