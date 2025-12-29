import React, { useEffect, useState } from 'react';
import { Button, Select } from 'erxes-ui';

import Header from './Header';
import Sidebar from './Sidebar';

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
    setConfigs(prev => [
      ...prev,
      {
        _id: crypto.randomUUID(),
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
    save({
      ...configsMap,
      dealsProductsDefaultFilter: configs,
    });
  };

  return (
    <div className="flex h-full">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <Header />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Default filter configs</h2>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={addConfig}>
              New config
            </Button>

            <Button variant="default" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {configs.map(config => (
            <div
              key={config._id}
              className="border rounded-md p-4 bg-white space-y-4"
            >
              {/* Card header */}
              <div className="flex items-center justify-between">
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

              {/* Card body */}
              <div className="grid grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Title</label>
                  <input
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

                {/* Segment */}
                <div className="space-y-1">
                  <label className="text-sm font-medium">Segment</label>
                  <Select
                    value={config.segmentId}
                    onValueChange={segmentId =>
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
                      {SEGMENTS.map(segment => (
                        <Select.Item
                          key={segment.id}
                          value={segment.id}
                        >
                          {segment.name}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
              </div>

              {/* Users */}
              <div>
                <p className="text-sm font-semibold mb-2">
                  Assigned users
                </p>

                <div className="flex flex-wrap gap-3">
                  {USERS.map(user => (
                    <label
                      key={user.id}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={config.userIds.includes(user.id)}
                        onChange={() =>
                          toggleUser(config, user.id)
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
            <div className="text-sm text-muted-foreground text-center py-10">
              No default filter configs yet. Click “New config” to add one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DefaultFilterSettings;
