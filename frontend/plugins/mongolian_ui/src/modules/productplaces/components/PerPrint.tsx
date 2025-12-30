import React from 'react';
import { Button, Select } from 'erxes-ui';
import { PerPrintConfig } from '../types';

type Props = {
  config: PerPrintConfig;
  currentConfigKey: string;
  save: (key: string, config: PerPrintConfig) => void;
  delete: (key: string) => void;
};

const PerPrint = ({ config, currentConfigKey, save, delete: deleteHandler }: Props) => {
  if (!config) {
    return null;
  }

  const onChangeConfig = (key: keyof PerPrintConfig, value: any) => {
    save(currentConfigKey, {
      ...config,
      [key]: value,
    });
  };

  return (
    <div className="rounded border p-4 space-y-6 bg-white">
      {/* MAIN SETTINGS */}
      <div className="grid grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Print type</label>
            <Select
              value={config.type || ''}
              onValueChange={(v) => onChangeConfig('type', v)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose print type" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="invoice">Invoice</Select.Item>
                <Select.Item value="receipt">Receipt</Select.Item>
                <Select.Item value="label">Label</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Paper size</label>
            <Select
              value={config.paperSize || ''}
              onValueChange={(v) => onChangeConfig('paperSize', v)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose paper size" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="A4">A4</Select.Item>
                <Select.Item value="A5">A5</Select.Item>
                <Select.Item value="80mm">80mm</Select.Item>
              </Select.Content>
            </Select>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Copies</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={config.copies ?? ''}
              min={1}
              onChange={(e) =>
                onChangeConfig('copies', Number(e.target.value))
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Printer</label>
            <Select
              value={config.printerId || ''}
              onValueChange={(v) => onChangeConfig('printerId', v)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose printer" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteHandler(currentConfigKey)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default PerPrint;
