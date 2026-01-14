import React from 'react';
import { Button } from 'erxes-ui';
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
  /* =========================
   * HELPER: UPDATE FIELD
   * ========================= */
  const onChangeConfig = (key: keyof PerSplitConfig, value: any) => {
    save({ ...config, [key]: value });
  };

  return (
    <div className="rounded border p-4 space-y-6 bg-white">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <input
          className="w-full p-2 border rounded"
          value={config.title}
          onChange={(e) => onChangeConfig('title', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Board ID</label>
        <input
          className="w-full p-2 border rounded"
          value={config.boardId}
          onChange={(e) => onChangeConfig('boardId', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Pipeline ID</label>
        <input
          className="w-full p-2 border rounded"
          value={config.pipelineId}
          onChange={(e) => onChangeConfig('pipelineId', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Stage ID</label>
        <input
          className="w-full p-2 border rounded"
          value={config.stageId}
          onChange={(e) => onChangeConfig('stageId', e.target.value)}
        />
      </div>

      {/* Example multi-selects for categories, tags, products, segments */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Product Categories</label>
        <select
          className="w-full p-2 border rounded"
          multiple
          value={config.productCategoryIds}
          onChange={(e) =>
            onChangeConfig(
              'productCategoryIds',
              Array.from(e.target.selectedOptions, (o) => o.value)
            )
          }
        >
          {productCategories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Product Tags</label>
        <select
          className="w-full p-2 border rounded"
          multiple
          value={config.productTagIds}
          onChange={(e) =>
            onChangeConfig(
              'productTagIds',
              Array.from(e.target.selectedOptions, (o) => o.value)
            )
          }
        >
          {tags.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Products</label>
        <select
          className="w-full p-2 border rounded"
          multiple
          value={config.excludeProductIds}
          onChange={(e) =>
            onChangeConfig(
              'excludeProductIds',
              Array.from(e.target.selectedOptions, (o) => o.value)
            )
          }
        >
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Segments</label>
        <select
          className="w-full p-2 border rounded"
          multiple
          value={config.segments}
          onChange={(e) =>
            onChangeConfig(
              'segments',
              Array.from(e.target.selectedOptions, (o) => o.value)
            )
          }
        >
          {segments.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
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
