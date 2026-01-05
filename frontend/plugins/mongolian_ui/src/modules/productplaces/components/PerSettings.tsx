import React from 'react';
import { Button, Select, Switch } from 'erxes-ui';
import { PerSplitConfig, ProductCategory, Tag, Product, Segment } from '../types';

type Props = {
  configsMap: any;
  config: PerSplitConfig;
  currentConfigKey: string;
  save: (configsMap: any) => void;
  delete: (currentConfigKey: string) => void;
  productCategories: ProductCategory[];
  tags: Tag[];
  products: Product[];
  segments: Segment[];
};

const PerSettings = ({ 
  config, 
  currentConfigKey, 
  save, 
  delete: deleteHandler,
  productCategories,
  tags,
  products,
  segments
}: Props) => {
  const onChangeConfig = (key: keyof PerSplitConfig, value: any) => {
    // Create a new configsMap update
    const updatedConfig = {
      ...config,
      [key]: value,
    };
    
    // This should be updated to actually save to configsMap
    // For now, we'll pass it back through save
    save({
      dealsProductsDataSplit: {
        [currentConfigKey]: updatedConfig
      }
    });
  };

  // For multi-select arrays, we need a different approach
  // Since Select component only accepts string values
  
  const renderMultiSelect = (
    label: string,
    value: string[] = [],
    options: { _id: string; name: string }[],
    onChange: (ids: string[]) => void,
    placeholder: string
  ) => (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = value.includes(option._id);
          return (
            <label
              key={option._id}
              className="flex items-center gap-1 text-sm cursor-pointer border px-2 py-1 rounded"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {
                  const newValue = isSelected
                    ? value.filter(id => id !== option._id)
                    : [...value, option._id];
                  onChange(newValue);
                }}
              />
              {option.name}
            </label>
          );
        })}
        {options.length === 0 && (
          <span className="text-sm text-gray-500">{placeholder}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded border p-4 space-y-6 bg-white">
      {/* BASIC SETTINGS */}
      <div className="grid grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Title</label>
            <input
              className="w-full p-2 border rounded"
              value={config.title || ''}
              onChange={(e) => onChangeConfig('title', e.target.value)}
              placeholder="Config title"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Board</label>
            <Select
              value={config.boardId || ''}
              onValueChange={(v) => onChangeConfig('boardId', v)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose board" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="board1">Board 1</Select.Item>
                <Select.Item value="board2">Board 2</Select.Item>
              </Select.Content>
            </Select>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Pipeline</label>
            <Select
              value={config.pipelineId || ''}
              onValueChange={(v) => onChangeConfig('pipelineId', v)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose pipeline" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="pipeline1">Pipeline 1</Select.Item>
                <Select.Item value="pipeline2">Pipeline 2</Select.Item>
              </Select.Content>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Stage</label>
            <Select
              value={config.stageId || ''}
              onValueChange={(v) => onChangeConfig('stageId', v)}
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose stage" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="stage1">Stage 1</Select.Item>
                <Select.Item value="stage2">Stage 2</Select.Item>
              </Select.Content>
            </Select>
          </div>
        </div>
      </div>

      {/* CATEGORIES & TAGS - Using multi-select checkboxes */}
      <div className="rounded border p-4 space-y-4">
        {renderMultiSelect(
          "Product Categories",
          config.productCategoryIds || [],
          productCategories,
          (ids) => onChangeConfig('productCategoryIds', ids),
          "No categories available"
        )}

        {renderMultiSelect(
          "Exclude Categories",
          config.excludeCategoryIds || [],
          productCategories,
          (ids) => onChangeConfig('excludeCategoryIds', ids),
          "No categories available"
        )}

        {renderMultiSelect(
          "Product Tags",
          config.productTagIds || [],
          tags,
          (ids) => onChangeConfig('productTagIds', ids),
          "No tags available"
        )}

        {renderMultiSelect(
          "Exclude Tags",
          config.excludeTagIds || [],
          tags,
          (ids) => onChangeConfig('excludeTagIds', ids),
          "No tags available"
        )}

        {renderMultiSelect(
          "Exclude Products",
          config.excludeProductIds || [],
          products,
          (ids) => onChangeConfig('excludeProductIds', ids),
          "No products available"
        )}

        {renderMultiSelect(
          "Segments",
          config.segments || [],
          segments,
          (ids) => onChangeConfig('segments', ids),
          "No segments available"
        )}
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

export default PerSettings;