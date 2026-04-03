import { useState, useEffect } from 'react';
import { Label, Switch, Select, Input } from 'erxes-ui';

interface WaitingScreenData {
  isActive?: boolean;
  isPrint?: boolean;
  type?: string;
  contentUrl?: string;
  value?: string;
}

interface WaitingScreenProps {
  data?: WaitingScreenData;
  onChange: (data: WaitingScreenData) => void;
}

const changeTypeOptions = [
  { value: 'time', label: 'Time' },
  { value: 'count', label: 'Count' },
];

export const WaitingScreen: React.FC<WaitingScreenProps> = ({
  data,
  onChange,
}) => {
  const [isActive, setIsActive] = useState(data?.isActive ?? false);
  const [type, setType] = useState(data?.type || 'time');
  const [value, setValue] = useState(data?.value || '');
  const [contentUrl, setContentUrl] = useState(data?.contentUrl || '');

  useEffect(() => {
    if (data) {
      setIsActive(data.isActive ?? false);
      setType(data.type || 'time');
      setValue(data.value || '');
      setContentUrl(data.contentUrl || '');
    }
  }, [data]);

  const handleChange = (updates: Partial<WaitingScreenData>) => {
    onChange({
      isActive,
      type,
      value,
      contentUrl,
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
        <Label>WAITING SCREEN</Label>
      </div>

      {isActive && (
        <div className="pt-2 space-y-4">
          <div className="space-y-2">
            <Label>CHANGE TYPE</Label>
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
                {changeTypeOptions.map((opt) => (
                  <Select.Item key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              {type === 'time' ? 'CHANGE TIME (MIN)' : 'CHANGE COUNT'}
            </Label>
            <Input
              value={value}
              type="number"
              onChange={(e) => {
                setValue(e.target.value);
                handleChange({ value: e.target.value });
              }}
              placeholder={
                type === 'time' ? 'Enter time in minutes' : 'Enter count'
              }
            />
          </div>

          <div className="space-y-2">
            <Label>CONTENT URL</Label>
            <Input
              value={contentUrl}
              type="text"
              onChange={(e) => {
                setContentUrl(e.target.value);
                handleChange({ contentUrl: e.target.value });
              }}
              placeholder="Enter content URL"
            />
          </div>
        </div>
      )}
    </div>
  );
};
