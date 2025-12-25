import React, { useState } from 'react';
import { Button, Form, Select, MultipleSelector } from 'erxes-ui';
import { Collapsible } from 'erxes-ui/components/collapsible';

import { PerSplitConfig, IConfigsMap, PerSettingsProps } from '../types';

// Types for select options
interface ProductCategoryOption {
  _id: string;
  name: string;
}

interface TagOption {
  _id: string;
  name: string;
  type?: string;
}

interface ProductOption {
  _id: string;
  name: string;
}

interface SegmentOption {
  _id: string;
  name: string;
}

// Props extended with data options
interface ExtendedProps extends PerSettingsProps {
  productCategories: ProductCategoryOption[];
  tags: TagOption[];
  products: ProductOption[];
  segments: SegmentOption[];
}

const PerSettings = ({
  configsMap,
  config: initialConfig,
  currentConfigKey,
  save,
  delete: deleteConfig,
  productCategories,
  tags,
  products,
  segments,
}: ExtendedProps) => {
  const [config, setConfig] = useState<PerSplitConfig>(initialConfig);

  const onChangeConfig = (key: keyof PerSplitConfig, value: any) => {
    setConfig((prev: PerSplitConfig) => ({ ...prev, [key]: value }));
  };

  const onChangeInput = (key: keyof PerSplitConfig, e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeConfig(key, e.target.value);
  };

  const onSave = () => {
    if (!config.stageId) return;
    
    const updatedConfigsMap: IConfigsMap = { ...configsMap };
    
    // Remove old key
    delete updatedConfigsMap[currentConfigKey];
    
    // Add with new key
    updatedConfigsMap[config.stageId] = config;
    
    save(updatedConfigsMap);
  };

  const onDelete = () => {
    deleteConfig(currentConfigKey);
  };

  // Convert product categories to MultiSelectOption format
  const productCategoryOptions = productCategories.map(category => ({
    value: category._id,
    label: category.name,
  }));

  // Convert tags to MultiSelectOption format
  const tagOptions = tags.map(tag => ({
    value: tag._id,
    label: tag.name,
  }));

  // Convert products to MultiSelectOption format
  const productOptions = products.map(product => ({
    value: product._id,
    label: product.name,
  }));

  // Convert segments to MultiSelectOption format
  const segmentOptions = segments.map(segment => ({
    value: segment._id,
    label: segment.name,
  }));

  // Convert string[] to MultiSelectOption[] for current values
  const getSelectedOptions = (ids: string[] = [], allOptions: Array<{ value: string; label: string }>) => {
    return allOptions.filter(option => ids.includes(option.value));
  };

  return (
    <Collapsible
      defaultOpen={currentConfigKey === "newPlacesConfig"}
      className="rounded border p-4 space-y-6"
    >
      {/* HEADER */}
      <Collapsible.TriggerButton>
        <div className="flex w-full items-center justify-between">
          <span className="text-sm font-semibold">
            {config.title || 'Split config'}
          </span>
          <Collapsible.TriggerIcon className="h-4 w-4" />
        </div>
      </Collapsible.TriggerButton>

      {/* CONTENT */}
      <Collapsible.Content className="space-y-6">
        {/* TITLE */}
        <Form.Item>
          <Form.Label>Title</Form.Label>
          <Form.Control>
            <input
              value={config.title || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChangeInput('title', e)
              }
              required
              autoFocus
            />
          </Form.Control>
        </Form.Item>

        {/* BOARD / PIPELINE / STAGE */}
        <div className="grid grid-cols-3 gap-4 rounded border p-4">
          <Form.Item>
            <Form.Label>Board</Form.Label>
            <Select
              value={config.boardId || ''}
              onValueChange={(v: string) => onChangeConfig('boardId', v)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select board" />
              </Select.Trigger>
              <Select.Content>
                {/* TODO: Map boards data */}
              </Select.Content>
            </Select>
          </Form.Item>

          <Form.Item>
            <Form.Label>Pipeline</Form.Label>
            <Select
              value={config.pipelineId || ''}
              onValueChange={(v: string) => onChangeConfig('pipelineId', v)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select pipeline" />
              </Select.Trigger>
              <Select.Content>
                {/* TODO: Map pipelines data */}
              </Select.Content>
            </Select>
          </Form.Item>

          <Form.Item>
            <Form.Label>Stage</Form.Label>
            <Select
              value={config.stageId || ''}
              onValueChange={(v: string) => onChangeConfig('stageId', v)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select stage" />
              </Select.Trigger>
              <Select.Content>
                {/* TODO: Map stages data */}
              </Select.Content>
            </Select>
          </Form.Item>
        </div>

        {/* PRODUCT CATEGORIES */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <Form.Item>
              <Form.Label>Product Category</Form.Label>
              <Form.Control>
                <MultipleSelector
                  value={getSelectedOptions(config.productCategoryIds, productCategoryOptions)}
                  options={productCategoryOptions}
                  placeholder="Choose product category"
                  onChange={(options) => 
                    onChangeConfig('productCategoryIds', options.map(opt => opt.value))
                  }
                  maxSelected={100}
                  hideClearAllButton={false}
                  className="w-full"
                />
              </Form.Control>
            </Form.Item>

            <Form.Item>
              <Form.Label>Product Tags</Form.Label>
              <Form.Control>
                <MultipleSelector
                  value={getSelectedOptions(config.productTagIds, tagOptions)}
                  options={tagOptions}
                  placeholder="Choose product tags"
                  onChange={(options) => 
                    onChangeConfig('productTagIds', options.map(opt => opt.value))
                  }
                  maxSelected={100}
                  hideClearAllButton={false}
                  className="w-full"
                />
              </Form.Control>
            </Form.Item>

            <Form.Item>
              <Form.Label>Segment</Form.Label>
              <Form.Control>
                <MultipleSelector
                  value={getSelectedOptions(config.segments, segmentOptions)}
                  options={segmentOptions}
                  placeholder="Choose segments"
                  onChange={(options) => 
                    onChangeConfig('segments', options.map(opt => opt.value))
                  }
                  maxSelected={100}
                  hideClearAllButton={false}
                  className="w-full"
                />
              </Form.Control>
            </Form.Item>
          </div>

          <div className="space-y-4">
            <Form.Item>
              <Form.Label>Exclude Categories</Form.Label>
              <Form.Control>
                <MultipleSelector
                  value={getSelectedOptions(config.excludeCategoryIds, productCategoryOptions)}
                  options={productCategoryOptions}
                  placeholder="Choose categories to exclude"
                  onChange={(options) => 
                    onChangeConfig('excludeCategoryIds', options.map(opt => opt.value))
                  }
                  maxSelected={100}
                  hideClearAllButton={false}
                  className="w-full"
                />
              </Form.Control>
            </Form.Item>

            <Form.Item>
              <Form.Label>Exclude Tags</Form.Label>
              <Form.Control>
                <MultipleSelector
                  value={getSelectedOptions(config.excludeTagIds, tagOptions)}
                  options={tagOptions}
                  placeholder="Choose tags to exclude"
                  onChange={(options) => 
                    onChangeConfig('excludeTagIds', options.map(opt => opt.value))
                  }
                  maxSelected={100}
                  hideClearAllButton={false}
                  className="w-full"
                />
              </Form.Control>
            </Form.Item>

            <Form.Item>
              <Form.Label>Exclude Products</Form.Label>
              <Form.Control>
                <MultipleSelector
                  value={getSelectedOptions(config.excludeProductIds, productOptions)}
                  options={productOptions}
                  placeholder="Choose products to exclude"
                  onChange={(options) => 
                    onChangeConfig('excludeProductIds', options.map(opt => opt.value))
                  }
                  maxSelected={100}
                  hideClearAllButton={false}
                  className="w-full"
                />
              </Form.Control>
            </Form.Item>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap justify-end gap-2 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={onDelete}
            className="flex items-center gap-2"
          >
            Delete
          </Button>

          <Button
            variant="default"
            disabled={!config.stageId}
            onClick={onSave}
            className="flex items-center gap-2"
          >
            Save
          </Button>
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
};

export default PerSettings;