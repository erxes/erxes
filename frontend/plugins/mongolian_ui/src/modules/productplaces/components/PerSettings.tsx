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

/**
 * Builds data for MultipleSelector
 * - options: full list
 * - value: selected list with safe label fallback
 */
const buildMultiSelect = (
  items: Item[] = [],
  selectedIds: string[] = []
): {
  options: MultiSelectOption[];
  value: MultiSelectOption[];
} => {
  const map = new Map(items.map((i) => [i._id, i.name]));

  return {
    options: items.map((i) => ({
      value: i._id,
      label: i.name,
    })),
    value: selectedIds.map((id) => ({
      value: id,
      label: map.get(id) ?? id,
    })),
  };
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

      {/* Multi-selects */}
      <div className="space-y-2">
        <Label>Product Categories</Label>
        <MultipleSelector
          {...buildMultiSelect(
            productCategories,
            config.productCategoryIds ?? []
          )}
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
          {...buildMultiSelect(
            tags,
            config.productTagIds ?? []
          )}
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
          {...buildMultiSelect(
            products,
            config.excludeProductIds ?? []
          )}
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
          {...buildMultiSelect(
            segments,
            config.segments ?? []
          )}
          onChange={(opts) =>
            onChangeConfig(
              'segments',
              opts.map((o) => o.value)
            )
          }
        />
      </div>

      {/* Footer */}
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