import React from 'react';
import { Button, Form, Select } from 'erxes-ui';
import { IConfigsMap, PerSplitConfig } from '../types';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

/* Mock data – replace with real data later */
const mockProductCategories = [
  { _id: '1', name: 'Category 1' },
  { _id: '2', name: 'Category 2' },
];

const mockTags = [
  { _id: '1', name: 'Tag 1' },
  { _id: '2', name: 'Tag 2' },
];

const mockProducts = [
  { _id: '1', name: 'Product 1' },
  { _id: '2', name: 'Product 2' },
];

const mockSegments = [
  { _id: '1', name: 'Segment 1' },
  { _id: '2', name: 'Segment 2' },
];

const SettingsSplit = (props: Props) => {
  const { configsMap, save } = props;

  /* =========================
   * ADD NEW CONFIG
   * ========================= */
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
        ...(configsMap.dealsProductsDataSplit || {}),
        [configKey]: newSplitConfig,
      },
    };

    save(updatedConfigsMap);
  };

  /* =========================
   * DELETE CONFIG
   * ========================= */
  const deleteHandler = (currentConfigKey: string) => {
    const updatedConfigsMap: IConfigsMap = {
      ...configsMap,
      dealsProductsDataSplit: {
        ...(configsMap.dealsProductsDataSplit || {}),
      },
    };

    delete updatedConfigsMap.dealsProductsDataSplit![currentConfigKey];

    save(updatedConfigsMap);
  };

  /* =========================
   * UPDATE / SAVE CONFIG
   * ========================= */
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

  /* =========================
   * RENDER CONFIGS
   * ========================= */
  const renderConfigs = () => {
    const configs = configsMap.dealsProductsDataSplit || {};

    return Object.keys(configs).map((key) => {
      const config = configs[key] as PerSplitConfig;

      return (
        <div key={key} className="border rounded p-4 mb-4">
          <Form.Item>
            <Form.Label>Title</Form.Label>
            <Form.Control>
              <input
                value={config.title || ''}
                onChange={(e) =>
                  updateConfig(key, { ...config, title: e.target.value })
                }
              />
            </Form.Control>
          </Form.Item>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <Form.Item>
              <Form.Label>Board</Form.Label>
              <Select
                value={config.boardId || ''}
                onValueChange={(v) =>
                  updateConfig(key, { ...config, boardId: v })
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select board" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="board1">Board 1</Select.Item>
                  <Select.Item value="board2">Board 2</Select.Item>
                </Select.Content>
              </Select>
            </Form.Item>

            <Form.Item>
              <Form.Label>Pipeline</Form.Label>
              <Select
                value={config.pipelineId || ''}
                onValueChange={(v) =>
                  updateConfig(key, { ...config, pipelineId: v })
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select pipeline" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="pipeline1">Pipeline 1</Select.Item>
                  <Select.Item value="pipeline2">Pipeline 2</Select.Item>
                </Select.Content>
              </Select>
            </Form.Item>

            <Form.Item>
              <Form.Label>Stage</Form.Label>
              <Select
                value={config.stageId || ''}
                onValueChange={(v) =>
                  updateConfig(key, { ...config, stageId: v })
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select stage" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="stage1">Stage 1</Select.Item>
                  <Select.Item value="stage2">Stage 2</Select.Item>
                </Select.Content>
              </Select>
            </Form.Item>
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
      </div>
    </div>
  );
};

export default SettingsSplit;
