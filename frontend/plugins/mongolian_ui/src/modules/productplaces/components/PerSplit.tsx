import { Button, Label } from 'erxes-ui';

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
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor={`split-by-${split.id}`}>Split by</Label>
            <select
              id={`split-by-${split.id}`}
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
            <Label htmlFor={`split-operator-${split.id}`}>Operator</Label>
            <select
              id={`split-operator-${split.id}`}
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
            <Label htmlFor={`split-value-${split.id}`}>Value</Label>
            <input
              id={`split-value-${split.id}`}
              className="w-full p-2 border rounded"
              value={split.value?.toString() || ''}
              onChange={(e) => onChangeConfig('value', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => onRemove(split.id)}>
          Delete
        </Button>
      </div>
    </div>
  );
};

export default PerSplit;
