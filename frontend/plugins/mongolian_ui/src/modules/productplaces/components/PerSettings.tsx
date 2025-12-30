import React from 'react';
import { Button, Select, Switch } from 'erxes-ui';

type Props = {
  settings: any;
  onChange: (id: string, settings: any) => void;
  onRemove: (id: string) => void;
};

const PerSettings = ({ settings, onChange, onRemove }: Props) => {
  const onChangeConfig = (key: string, value: any) => {
    onChange(settings.id, { ...settings, [key]: value });
  };

  return (
    <div className="rounded border p-4 space-y-6 bg-white">
      {/* SETTINGS */}
      <div className="grid grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <input
              className="w-full p-2 border rounded"
              value={settings.name || ''}
              onChange={(e) => onChangeConfig('name', e.target.value)}
              placeholder="Config name"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Active</label>
            <Switch
              checked={!!settings.isActive}
              onCheckedChange={(v) => onChangeConfig('isActive', v)}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Apply mode</label>
            <Select
              value={settings.applyMode || ''}
              onValueChange={(v) => onChangeConfig('applyMode', v)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose mode" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="always">Always</Select.Item>
                <Select.Item value="conditional">Conditional</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Priority</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={settings.priority ?? ''}
              onChange={(e) =>
                onChangeConfig('priority', Number(e.target.value))
              }
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(settings.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default PerSettings;
