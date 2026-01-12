import React, { useEffect, useState } from 'react';
import { Button } from 'erxes-ui';
import { Select } from 'erxes-ui'; // This imports the correct Select component
import { nanoid } from 'nanoid';
import { IConfigsMap, DefaultFilterConfig } from '../types';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

/**
 * Temporary static data
 * (replace with real data from API later)
 */
const SEGMENTS = [
  { id: 'segment-1', name: 'Segment A' },
  { id: 'segment-2', name: 'Segment B' },
];

const USERS = [
  { id: 'user-1', name: 'Alice' },
  { id: 'user-2', name: 'Bob' },
  { id: 'user-3', name: 'Charlie' },
];

const DefaultFilterSettings = ({ save, configsMap }: Props) => {
  const [configs, setConfigs] = useState<DefaultFilterConfig[]>([]);

  /**
   * Sync local state with configsMap
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
    setConfigs(prev => [...prev, newConfig]);
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
    save({
      ...configsMap,
      dealsProductsDefaultFilter: configs,
    });
  };

  return (
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
        <Button variant="default" onClick={addConfig}>
          + New Config
        </Button>
        <Button variant="default" onClick={handleSave}>
          Save All
        </Button>
      </div>

      <div className="space-y-4">
        {configs.map(config => (
          <div key={config._id} className="border rounded p-4 bg-white">
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
              {/* Title Field */}
              <div className="space-y-2">
                <label 
                  htmlFor={`title-${config._id}`}
                  className="text-sm font-medium block"
                >
                  Title
                </label>
                <input
                  id={`title-${config._id}`}
                  className="w-full p-2 border rounded"
                  value={config.title}
                  onChange={e =>
                    updateConfig(config._id, {
                      ...config,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              {/* Segment Field - CORRECT Select Usage */}
              <div className="space-y-2">
                <label className="text-sm font-medium block">
                  Segment
                </label>
                {/* This is the correct way to use the Select component */}
                <Select
                  value={config.segmentId}
                  onValueChange={(segmentId: string) =>
                    updateConfig(config._id, {
                      ...config,
                      segmentId,
                    })
                  }
                >
                  <Select.Trigger className="w-full">
                    <Select.Value placeholder="Choose segment" />
                  </Select.Trigger>
                  <Select.Content>
                    {SEGMENTS.map(segment => (
                      <Select.Item key={segment.id} value={segment.id}>
                        {segment.name}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            </div>

            {/* Users Section */}
            <div className="mt-4">
              <p className="text-sm font-semibold mb-2">
                Assigned users
              </p>
              
              <div className="flex flex-wrap gap-3">
                {USERS.map(user => (
                  <label
                    key={user.id}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                    htmlFor={`user-${config._id}-${user.id}`}
                  >
                    <input
                      id={`user-${config._id}-${user.id}`}
                      type="checkbox"
                      checked={config.userIds.includes(user.id)}
                      onChange={() => toggleUser(config, user.id)}
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
  );
};

export default DefaultFilterSettings;