import { useEffect, useState } from 'react';
import { Button, Select } from 'erxes-ui';
import { nanoid } from 'nanoid';
import { Label } from 'erxes-ui/components/label';
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

  useEffect(() => {
    const data = configsMap.dealsProductsDefaultFilter;
    setConfigs(Array.isArray(data) ? data : []);
  }, [configsMap.dealsProductsDefaultFilter]);

  const addConfig = () => {
    const newConfig: DefaultFilterConfig = {
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
        <h2 className="text-lg font-semibold">Default Filter Configuration</h2>
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
        {configs.map(config => {
          const segmentSelectId = `segment-${config._id}`;

          return (
            <div key={config._id} className="border rounded p-4 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">{config.title || 'Untitled'}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteConfig(config._id)}
                >
                  Delete
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor={`title-${config._id}`}>Title</Label>
                  <input
                    id={`title-${config._id}`}
                    className="w-full p-2 border rounded"
                    value={config.title}
                    onChange={e =>
                      updateConfig(config._id, { ...config, title: e.target.value })
                    }
                  />
                </div>

                {/* Segment */}
                <div className="space-y-2">
                  <Label htmlFor={segmentSelectId}>Segment</Label>
                  <Select
                    value={config.segmentId}
                    onValueChange={(segmentId: string) =>
                      updateConfig(config._id, { ...config, segmentId })
                    }
                  >
                    <Select.Trigger id={segmentSelectId} className="w-full">
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

              {/* Users */}
              <div className="mt-4">
                <Label>Assigned users</Label>
                <div className="flex flex-wrap gap-3 mt-1">
                  {USERS.map(user => (
                    <Label
                      key={user.id}
                      htmlFor={`user-${config._id}-${user.id}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        id={`user-${config._id}-${user.id}`}
                        type="checkbox"
                        checked={config.userIds.includes(user.id)}
                        onChange={() => toggleUser(config, user.id)}
                      />
                      {user.name}
                    </Label>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

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
