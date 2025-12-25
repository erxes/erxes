// frontend/plugins/mongolian_ui/src/modules/productplaces/components/SettingsFilter.tsx
import React, { useState } from 'react';
import { Button, Form, Select } from 'erxes-ui';
import { IConfigsMap, DefaultFilterConfig } from '../types';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

// Mock data
const SEGMENTS = [
  { _id: 'segment-1', name: 'Segment A' },
  { _id: 'segment-2', name: 'Segment B' },
];

const USERS = [
  { _id: 'user-1', name: 'Alice' },
  { _id: 'user-2', name: 'Bob' },
  { _id: 'user-3', name: 'Charlie' },
];

const SettingsFilter = (props: Props) => {
  const defaultFilterData = props.configsMap.dealsProductsDefaultFilter;
  const initialConfigs: DefaultFilterConfig[] = Array.isArray(defaultFilterData) 
    ? defaultFilterData 
    : [];

  const [configs, setConfigs] = useState<DefaultFilterConfig[]>(initialConfigs);

  const addConfig = () => {
    setConfigs(prev => [
      ...prev,
      {
        _id: `config_${Date.now()}`,
        title: 'New Filter Config',
        segmentId: '',
        userIds: [],
      },
    ]);
  };

  const updateConfig = (id: string, updated: DefaultFilterConfig) => {
    setConfigs(prev => prev.map(c => (c._id === id ? updated : c)));
  };

  const deleteConfig = (id: string) => {
    setConfigs(prev => prev.filter(c => c._id !== id));
  };

  const toggleUser = (config: DefaultFilterConfig, userId: string) => {
    const exists = config.userIds.includes(userId);
    updateConfig(config._id, {
      ...config,
      userIds: exists
        ? config.userIds.filter(id => id !== userId)
        : [...config.userIds, userId],
    });
  };

  const handleSave = () => {
    props.save({
      ...props.configsMap,
      dealsProductsDefaultFilter: configs,
    });
  };

  return (
    <div className="space-y-4">
      <div className="border-b pb-4">
        <h2 className="text-lg font-semibold">Default Filter Configuration</h2>
        <p className="text-sm text-gray-500">
          Configure default product filters by segment
        </p>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="default" onClick={addConfig} className="flex items-center gap-2">
          + New Config
        </Button>
        <Button variant="default" onClick={handleSave}> {/* CHANGED: "primary" to "default" */}
          Save All
        </Button>
      </div>

      <div className="space-y-4">
        {configs.map((config) => (
          <div key={config._id} className="border rounded p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{config.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteConfig(config._id)}
              >
                Delete
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item>
                <Form.Label>Title</Form.Label>
                <Form.Control>
                  <input
                    className="w-full p-2 border rounded"
                    value={config.title}
                    onChange={(e) =>
                      updateConfig(config._id, {
                        ...config,
                        title: e.target.value,
                      })
                    }
                  />
                </Form.Control>
              </Form.Item>

              <Form.Item>
                <Form.Label>Segment</Form.Label>
                <Select
                  value={config.segmentId}
                  onValueChange={(segmentId: string) =>
                    updateConfig(config._id, {
                      ...config,
                      segmentId,
                    })
                  }
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Choose segment" />
                  </Select.Trigger>
                  <Select.Content>
                    {SEGMENTS.map((segment) => (
                      <Select.Item key={segment._id} value={segment._id}>
                        {segment.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Item>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold mb-2">Assigned users</p>
              <div className="flex flex-wrap gap-3">
                {USERS.map((user) => (
                  <label
                    key={user._id}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={config.userIds.includes(user._id)}
                      onChange={() => toggleUser(config, user._id)}
                      className="rounded"
                    />
                    {user.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsFilter;