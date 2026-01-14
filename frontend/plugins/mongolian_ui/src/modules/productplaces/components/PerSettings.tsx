import { useEffect, useState } from 'react';
import { Button } from 'erxes-ui';
import { nanoid } from 'nanoid';
import { PerSplitConfig } from '../types';
import PerSplit from './PerSplit';

type Props = {
  config: PerSplitConfig;
  currentConfigKey: string;
  save: (config: PerSplitConfig) => void;
  delete: (key: string) => void;
  productCategories: any[];
  tags: any[];
  products: any[];
  segments: any[];
};

const PerSettings = (props: Props) => {
  const {
    config,
    currentConfigKey,
    save,
    delete: deleteHandler,
    productCategories,
  } = props;
  const [localConfig, setLocalConfig] = useState<PerSplitConfig>(config);
  const [splits, setSplits] = useState<any[]>([]);

  // Normalize once for TS safety
  const productCategoryIds = localConfig.productCategoryIds ?? [];

  // Sync local state with prop changes
  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const updateLocalConfig = (key: keyof PerSplitConfig, value: any) => {
    const updated = { ...localConfig, [key]: value };
    setLocalConfig(updated);
    save(updated);
  };

  const addSplit = () => {
    setSplits(prev => [
      ...prev,
      {
        id: nanoid(),
        by: '',
        operator: '',
        value: '',
      },
    ]);
  };

  const updateSplit = (id: string, updatedSplit: any) => {
    setSplits(prev =>
      prev.map(split => (split.id === id ? updatedSplit : split)),
    );
  };

  const removeSplit = (id: string) => {
    setSplits(prev => prev.filter(split => split.id !== id));
  };

  return (
    <div className="rounded border p-6 space-y-6 mb-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {localConfig.title || 'Untitled Split Config'}
        </h3>

        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" onClick={() => save(localConfig)}>
            Save
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteHandler(currentConfigKey)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* BASIC SETTINGS */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label htmlFor="per-title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="per-title"
              className="w-full p-2 border rounded"
              value={localConfig.title || ''}
              onChange={e => updateLocalConfig('title', e.target.value)}
            />
          </div>

          {/* Stage */}
          <div className="space-y-1">
            <label htmlFor="per-stage" className="text-sm font-medium">
              Stage
            </label>
            <select
              id="per-stage"
              className="w-full p-2 border rounded"
              value={localConfig.stageId || ''}
              onChange={e => updateLocalConfig('stageId', e.target.value)}
            >
              <option value="">Choose stage</option>
              <option value="stage-1">Stage 1</option>
              <option value="stage-2">Stage 2</option>
            </select>
          </div>
        </div>

        {/* Product Categories */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="per-product-categories"
              className="text-sm font-medium"
            >
              Product Categories
            </label>

            <select
              id="per-product-categories"
              className="w-full p-2 border rounded"
              value=""
              onChange={e => {
                const value = e.target.value;
                if (!value) return;

                if (!productCategoryIds.includes(value)) {
                  updateLocalConfig('productCategoryIds', [
                    ...productCategoryIds,
                    value,
                  ]);
                }

                e.target.value = '';
              }}
            >
              <option value="">Add category</option>
              {productCategories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {productCategoryIds.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {productCategoryIds.map(id => {
                  const cat = productCategories.find(c => c._id === id);
                  if (!cat) return null;

                  return (
                    <span
                      key={id}
                      className="px-2 py-1 bg-gray-100 rounded text-sm"
                    >
                      {cat.name}
                      <button
                        type="button"
                        className="ml-2 text-red-500 hover:text-red-700"
                        onClick={() =>
                          updateLocalConfig(
                            'productCategoryIds',
                            productCategoryIds.filter(catId => catId !== id),
                          )
                        }
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SPLIT RULES */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium">Split Rules</h4>
          <Button variant="outline" size="sm" onClick={addSplit}>
            + Add Split Rule
          </Button>
        </div>

        <div className="space-y-4">
          {splits.map(split => (
            <PerSplit
              key={split.id}
              split={split}
              onChange={updateSplit}
              onRemove={removeSplit}
            />
          ))}

          {splits.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-8">
              No split rules yet. Click &quot;Add Split Rule&quot; to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerSettings;
