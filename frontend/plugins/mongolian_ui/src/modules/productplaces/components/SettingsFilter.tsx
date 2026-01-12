import React, { useEffect } from 'react';
import { Button, Form, Select } from 'erxes-ui';
import { useForm, Controller } from 'react-hook-form';
import { nanoid } from 'nanoid';
import { IConfigsMap, DefaultFilterConfig } from '../types';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

// Mock data (replace later)
const SEGMENTS = [
  { _id: 'segment-1', name: 'Segment A' },
  { _id: 'segment-2', name: 'Segment B' },
];

const USERS = [
  { _id: 'user-1', name: 'Alice' },
  { _id: 'user-2', name: 'Bob' },
  { _id: 'user-3', name: 'Charlie' },
];

const SettingsFilter = ({ save, configsMap }: Props) => {
  const [configs, setConfigs] = React.useState<DefaultFilterConfig[]>([]);
  
  // Initialize react-hook-form
  const form = useForm();

  /**
   * 🔑 Sync local state with configsMap
   * Fixes disappearing configs + broken New button
   */
  useEffect(() => {
    const data = configsMap.dealsProductsDefaultFilter;
    setConfigs(Array.isArray(data) ? data : []);
  }, [configsMap.dealsProductsDefaultFilter]);

  const addConfig = () => {
    const newConfig = {
      _id: nanoid(),
      title: 'New Filter Config',
      segmentId: '',
      userIds: [],
    };

    setConfigs(prev => [
      ...prev,
      newConfig,
    ]);
  };

  const updateConfig = (id: string, updated: DefaultFilterConfig) => {
    setConfigs(prev =>
      prev.map(c => (c._id === id ? updated : c)),
    );
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
    save({
      ...configsMap,
      dealsProductsDefaultFilter: configs,
    });
  };

  return (
    <Form {...form}> {/* Wrap everything in Form context */}
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold">
            Default Filter Configuration
          </h2>
          <p className="text-sm text-gray-500">
            Configure default product filters by segment
          </p>
        </div>

        <div className="flex justify-between items-center">
          <Button
            variant="default"
            onClick={addConfig}
            className="flex items-center gap-2"
          >
            + New Config
          </Button>

          <Button variant="default" onClick={handleSave}>
            Save All
          </Button>
        </div>

        <div className="space-y-4">
          {configs.map((config, index) => (
            <div
              key={config._id}
              className="border rounded p-4 bg-white"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">
                  {config.title || 'Untitled'}
                </h3>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteConfig(config._id)}
                >
                  Delete
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Title Field using Form.Field */}
                <Form.Field
                  name={`configs.${index}.title`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Title</Form.Label>
                      <Form.Control>
                        <input
                          className="w-full p-2 border rounded"
                          value={config.title || ''}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            updateConfig(config._id, {
                              ...config,
                              title: e.target.value,
                            });
                          }}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />

                {/* Segment Field using Form.Field with Controller for Select */}
                <Form.Field
                  name={`configs.${index}.segmentId`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Segment</Form.Label>
                      <Form.Control>
                        <Controller
                          control={form.control}
                          name={field.name}
                          render={({ field: controllerField }) => (
                            <Select
                              value={controllerField.value || ''}
                              onValueChange={(value: string) => {
                                controllerField.onChange(value);
                                updateConfig(config._id, {
                                  ...config,
                                  segmentId: value,
                                });
                              }}
                            >
                              <Select.Trigger>
                                <Select.Value placeholder="Choose segment" />
                              </Select.Trigger>
                              <Select.Content>
                                {SEGMENTS.map(segment => (
                                  <Select.Item
                                    key={segment._id}
                                    value={segment._id}
                                  >
                                    {segment.name}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select>
                          )}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">
                  Assigned users
                </p>

                <div className="flex flex-wrap gap-3">
                  {USERS.map(user => (
                    <label
                      key={user._id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                      htmlFor={`user-${config._id}-${user._id}`}
                    >
                      <input
                        id={`user-${config._id}-${user._id}`}
                        type="checkbox"
                        checked={config.userIds.includes(user._id)}
                        onChange={() =>
                          toggleUser(config, user._id)
                        }
                      />
                      {user.name}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {!configs.length && (
            <div className="text-sm text-gray-400 text-center py-10">
              No filter configs yet. Click "New Config" to add one.
            </div>
          )}
        </div>
      </div>
    </Form>
  );
};

export default SettingsFilter;