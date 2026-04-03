import { useState, useEffect } from 'react';
import { Label, Switch, Select, Input } from 'erxes-ui';

interface KitchenScreenData {
  isActive?: boolean;
  isPrint?: boolean;
  type?: string;
  showType?: string;
  value?: string;
}

interface KitchenScreenProps {
  data?: KitchenScreenData;
  onChange: (data: KitchenScreenData) => void;
}

const showTypeOptions = [
  { value: 'all', label: 'All saved orders' },
  { value: 'paid', label: 'Paid all orders' },
  { value: 'defined', label: 'Defined orders only' },
];

const statusChangeOptions = [
  { value: 'manual', label: 'Manual' },
  { value: 'time', label: 'Time' },
];

export const KitchenScreen: React.FC<KitchenScreenProps> = ({
  data,
  onChange,
}) => {
  const [isActive, setIsActive] = useState(data?.isActive ?? false);
  const [showType, setShowType] = useState(data?.showType || 'all');
  const [type, setType] = useState(data?.type || 'manual');
  const [value, setValue] = useState(data?.value || '');

  useEffect(() => {
    if (data) {
      setIsActive(data.isActive ?? false);
      setShowType(data.showType || 'all');
      setType(data.type || 'manual');
      setValue(data.value || '');
    }
  }, [data]);

  const handleChange = (updates: Partial<KitchenScreenData>) => {
    onChange({
      isActive,
      showType,
      type,
      value,
      ...updates,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <Switch
          checked={isActive}
          onCheckedChange={(checked) => {
            setIsActive(checked);
            handleChange({ isActive: checked });
          }}
        />
        <Label>KITCHEN SCREEN</Label>
      </div>

      {isActive && (
        <div className="pt-2 space-y-4">
          <div className="space-y-2">
            <Label>SHOW TYPES</Label>
            <Select
              value={showType}
              onValueChange={(val) => {
                setShowType(val);
                handleChange({ showType: val });
              }}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {showTypeOptions.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>STATUS CHANGE /LEAVE/</Label>
            <Select
              value={type}
              onValueChange={(val) => {
                setType(val);
                handleChange({ type: val });
              }}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {statusChangeOptions.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          {type === 'time' && (
            <div className="space-y-2">
              <Label>TIME (MINUTE)</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  handleChange({ value: e.target.value });
                }}
                placeholder="Enter time in minutes"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
