import React from 'react';
import { Button, Select } from 'erxes-ui';

type Props = {
  condition: any;
  onChange: (id: string, condition: any) => void;
  onRemove: (id: string) => void;
};

const PerConditions = ({ condition, onChange, onRemove }: Props) => {
  const onChangeConfig = (key: string, value: any) => {
    onChange(condition.id, { ...condition, [key]: value });
  };

  return (
    <div className="rounded border p-4 space-y-6 bg-white">
      {/* MAIN FORM */}
      <div className="grid grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Product Category</label>
            <Select
              value={condition.productCategoryIds}
              onValueChange={(v) =>
                onChangeConfig('productCategoryIds', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose product category" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Exclude categories</label>
            <Select
              value={condition.excludeCategoryIds}
              onValueChange={(v) =>
                onChangeConfig('excludeCategoryIds', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose categories to exclude" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Product Tags</label>
            <Select
              value={condition.productTagIds}
              onValueChange={(v) =>
                onChangeConfig('productTagIds', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose product tags" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Exclude tags</label>
            <Select
              value={condition.excludeTagIds}
              onValueChange={(v) =>
                onChangeConfig('excludeTagIds', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose tags to exclude" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Exclude products</label>
            <Select
              value={condition.excludeProductIds}
              onValueChange={(v) =>
                onChangeConfig('excludeProductIds', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose products to exclude" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Segment</label>
            <Select
              value={condition.segments}
              onValueChange={(v) =>
                onChangeConfig('segments', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose segments" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Low Count</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={condition.ltCount ?? ''}
              onChange={(e) =>
                onChangeConfig('ltCount', e.target.value)
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Great Count</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={condition.gtCount ?? ''}
              onChange={(e) =>
                onChangeConfig('gtCount', e.target.value)
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Low Unit Price</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={condition.ltUnitPrice ?? ''}
              onChange={(e) =>
                onChangeConfig('ltUnitPrice', e.target.value)
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Great Unit Price</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={condition.gtUnitPrice ?? ''}
              onChange={(e) =>
                onChangeConfig('gtUnitPrice', e.target.value)
              }
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Sub uom type</label>
            <Select
              value={condition.subUomType || ''}
              onValueChange={(v) =>
                onChangeConfig('subUomType', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Select option" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="">Not use</Select.Item>
                <Select.Item value="lt">Low than count</Select.Item>
                <Select.Item value="gte">
                  Greater, equal than count
                </Select.Item>
              </Select.Content>
            </Select>
          </div>
        </div>
      </div>

      {/* BRANCH & DEPARTMENT */}
      <div className="rounded border p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Set branch</label>
            <Select
              value={condition.branchId || ''}
              onValueChange={(v) =>
                onChangeConfig('branchId', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose branch" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Set department</label>
            <Select
              value={condition.departmentId || ''}
              onValueChange={(v) =>
                onChangeConfig('departmentId', v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Choose department" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </div>
        </div>
      </div>

      {/* DELETE */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(condition.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
};

export default PerConditions;
