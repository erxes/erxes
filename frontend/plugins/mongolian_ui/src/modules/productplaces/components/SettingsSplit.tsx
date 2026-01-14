import React from 'react';
import { Button } from 'erxes-ui';
import { Label } from 'erxes-ui/components/label';
import { IConfigsMap, PerSplitConfig } from '../types';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const SettingsSplit = (props: Props) => {
  const { configsMap, save } = props;

  const add = (e: React.MouseEvent) => {
    e.preventDefault();

    const configKey = `config_${Date.now()}`;
    const newSplitConfig: PerSplitConfig = {
      title: 'New Split Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      productCategoryIds: [],
      excludeCategoryIds: [],
      productTagIds: [],
      excludeTagIds: [],
      excludeProductIds: [],
      segments: [],
    };

    const updatedConfigsMap: IConfigsMap = {
      ...configsMap,
      dealsProductsDataSplit: {
        ...(configsMap.dealsProductsDataSplit),
        [configKey]: newSplitConfig,
      },
    };

    save(updatedConfigsMap);
  };

  const deleteHandler = (currentConfigKey: string) => {
    const updatedConfigsMap: IConfigsMap = {
      ...configsMap,
      dealsProductsDataSplit: {
        ...(configsMap.dealsProductsDataSplit),
      },
    };

    delete updatedConfigsMap.dealsProductsDataSplit![currentConfigKey];
    save(updatedConfigsMap);
  };

  const updateConfig = (key: string, config: PerSplitConfig) => {
    const updatedConfigsMap: IConfigsMap = {
      ...configsMap,
      dealsProductsDataSplit: {
        ...(configsMap.dealsProductsDataSplit || {}),
        [key]: config,
      },
    };

    save(updatedConfigsMap);
  };

  const renderConfigs = () => {
    const configs = configsMap.dealsProductsDataSplit || {};

    return Object.keys(configs).map((key) => {
      const config = configs[key];

      return (
        <div key={key} className="border rounded p-4 mb-4 bg-white">
          {/* Title Field */}
          <div className="space-y-1 mb-4">
            <Label>Title</Label>
            <input
              className="w-full p-2 border rounded"
              value={config.title || ''}
              onChange={(e) =>
                updateConfig(key, { ...config, title: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            {/* Board Field */}
            <div className="space-y-1">
              <Label>Board</Label>
              <select
                className="w-full p-2 border rounded"
                value={config.boardId || ''}
                onChange={(e) =>
                  updateConfig(key, { ...config, boardId: e.target.value })
                }
              >
                <option value="">Select board</option>
                <option value="board1">Board 1</option>
                <option value="board2">Board 2</option>
              </select>
            </div>

            {/* Pipeline Field */}
            <div className="space-y-1">
              <Label>Pipeline</Label>
              <select
                className="w-full p-2 border rounded"
                value={config.pipelineId || ''}
                onChange={(e) =>
                  updateConfig(key, {
                    ...config,
                    pipelineId: e.target.value,
                  })
                }
              >
                <option value="">Select pipeline</option>
                <option value="pipeline1">Pipeline 1</option>
                <option value="pipeline2">Pipeline 2</option>
              </select>
            </div>

            {/* Stage Field */}
            <div className="space-y-1">
              <Label>Stage</Label>
              <select
                className="w-full p-2 border rounded"
                value={config.stageId || ''}
                onChange={(e) =>
                  updateConfig(key, { ...config, stageId: e.target.value })
                }
              >
                <option value="">Select stage</option>
                <option value="stage1">Stage 1</option>
                <option value="stage2">Stage 2</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              variant="ghost"
              onClick={() => deleteHandler(key)}
              className="mr-2"
            >
              Delete
            </Button>
            <Button
              variant="default"
              onClick={() => updateConfig(key, config)}
            >
              Save
            </Button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="border-b pb-4">
        <h2 className="text-lg font-semibold">Split Configuration</h2>
        <p className="text-sm text-gray-500">
          Configure product split settings
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          variant="default"
          onClick={add}
          className="flex items-center gap-2"
        >
          + New Config
        </Button>
      </div>

      <div className="space-y-4">
        {renderConfigs()}

        {Object.keys(configsMap.dealsProductsDataSplit || {}).length === 0 && (
          <div className="text-sm text-gray-400 text-center py-10">
            No split configs yet. Click "New Config" to add one.
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsSplit;