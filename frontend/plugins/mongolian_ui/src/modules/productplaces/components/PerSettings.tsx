import React from 'react';
import { Button, Label, MultipleSelector, MultiSelectOption } from 'erxes-ui';
import { PerSplitConfig } from '../types';

type Item = { _id: string; name: string };

type Props = {
  config: PerSplitConfig;
  currentConfigKey: string;
  save: (updatedConfig: PerSplitConfig) => void;
  delete: (configKey: string) => void;
  productCategories: Item[];
  tags: Item[];
  products: Item[];
  segments: Item[];
};

const PerSettings = ({
  config,
  currentConfigKey,
  save,
  delete: deleteConfig,
  productCategories,
  tags,
  products,
  segments,
}: Props) => {
  const onChangeConfig = (key: keyof PerSplitConfig, value: any) => {
    save({ ...config, [key]: value });
  };

  // Helper to convert string[] to MultiSelectOption[]
  const toOptions = (items: Item[], selectedIds?: string[]): MultiSelectOption[] =>
    items.map((item) => ({
      value: item._id,
      label: item.name,
      fixed: false,
    })).filter((opt) => !selectedIds || selectedIds.includes(opt.value));

  return (
    <div className="rounded border p-4 space-y-6 bg-white">
      {/* Single field inputs */}
      <div className="space-y-2">
        <Label>Title</Label>
        <input
          className="w-full p-2 border rounded"
          value={config.title}
          onChange={(e) => onChangeConfig('title', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Board ID</Label>
        <input
          className="w-full p-2 border rounded"
          value={config.boardId}
          onChange={(e) => onChangeConfig('boardId', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Pipeline ID</Label>
        <input
          className="w-full p-2 border rounded"
          value={config.pipelineId}
          onChange={(e) => onChangeConfig('pipelineId', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Stage ID</Label>
        <input
          className="w-full p-2 border rounded"
          value={config.stageId}
          onChange={(e) => onChangeConfig('stageId', e.target.value)}
        />
      </div>

      {/* Multi-selects using MultipleSelector */}
      <div className="space-y-2">
        <Label>Product Categories</Label>
        <MultipleSelector
          value={(config.productCategoryIds ?? []).map((id) => ({
            value: id,
            label: productCategories.find((p) => p._id === id)?.name || id,
          }))}
          options={productCategories.map((p) => ({ value: p._id, label: p.name }))}
          onChange={(opts) =>
            onChangeConfig(
              'productCategoryIds',
              opts.map((o) => o.value)
            )
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Product Tags</Label>
        <MultipleSelector
          value={(config.productTagIds ?? []).map((id) => ({
            value: id,
            label: tags.find((t) => t._id === id)?.name || id,
          }))}
          options={tags.map((t) => ({ value: t._id, label: t.name }))}
          onChange={(opts) =>
            onChangeConfig(
              'productTagIds',
              opts.map((o) => o.value)
            )
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Products</Label>
        <MultipleSelector
          value={(config.excludeProductIds ?? []).map((id) => ({
            value: id,
            label: products.find((p) => p._id === id)?.name || id,
          }))}
          options={products.map((p) => ({ value: p._id, label: p.name }))}
          onChange={(opts) =>
            onChangeConfig(
              'excludeProductIds',
              opts.map((o) => o.value)
            )
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Segments</Label>
        <MultipleSelector
          value={(config.segments ?? []).map((id) => ({
            value: id,
            label: segments.find((s) => s._id === id)?.name || id,
          }))}
          options={segments.map((s) => ({ value: s._id, label: s.name }))}
          onChange={(opts) =>
            onChangeConfig(
              'segments',
              opts.map((o) => o.value)
            )
          }
        />
      </div>

      {/* Footer: Delete Button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteConfig(currentConfigKey)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default PerSettings;
