import { Button, Select } from 'erxes-ui';
import { Label } from 'erxes-ui/components/label';

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
          {/* Product Category */}
          <div className="space-y-1">
            <Label htmlFor={`product-category-${condition.id}`}>
              Product Category
            </Label>
            <Select
              value={condition.productCategoryIds}
              onValueChange={(v) =>
                onChangeConfig('productCategoryIds', v)
              }
            >
              <Select.Trigger id={`product-category-${condition.id}`}>
                <Select.Value placeholder="Choose product category" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </div>

          {/* Exclude Categories */}
          <div className="space-y-1">
            <Label htmlFor={`exclude-category-${condition.id}`}>
              Exclude categories
            </Label>
            <Select
              value={condition.excludeCategoryIds}
              onValueChange={(v) =>
                onChangeConfig('excludeCategoryIds', v)
              }
            >
              <Select.Trigger id={`exclude-category-${condition.id}`}>
                <Select.Value placeholder="Choose categories to exclude" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </div>

          {/* Product Tags */}
          <div className="space-y-1">
            <Label htmlFor={`product-tags-${condition.id}`}>
              Product Tags
            </Label>
            <Select
              value={condition.productTagIds}
              onValueChange={(v) =>
                onChangeConfig('productTagIds', v)
              }
            >
              <Select.Trigger id={`product-tags-${condition.id}`}>
                <Select.Value placeholder="Choose product tags" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </div>

          {/* Exclude Tags */}
          <div className="space-y-1">
            <Label htmlFor={`exclude-tags-${condition.id}`}>
              Exclude tags
            </Label>
            <Select
              value={condition.excludeTagIds}
              onValueChange={(v) =>
                onChangeConfig('excludeTagIds', v)
              }
            >
              <Select.Trigger id={`exclude-tags-${condition.id}`}>
                <Select.Value placeholder="Choose tags to exclude" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </div>

          {/* Exclude Products */}
          <div className="space-y-1">
            <Label htmlFor={`exclude-products-${condition.id}`}>
              Exclude products
            </Label>
            <Select
              value={condition.excludeProductIds}
              onValueChange={(v) =>
                onChangeConfig('excludeProductIds', v)
              }
            >
              <Select.Trigger id={`exclude-products-${condition.id}`}>
                <Select.Value placeholder="Choose products to exclude" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </div>

          {/* Segment */}
          <div className="space-y-1">
            <Label htmlFor={`segments-${condition.id}`}>
              Segment
            </Label>
            <Select
              value={condition.segments}
              onValueChange={(v) =>
                onChangeConfig('segments', v)
              }
            >
              <Select.Trigger id={`segments-${condition.id}`}>
                <Select.Value placeholder="Choose segments" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          <div className="space-y-1">
            <Label>Low Count</Label>
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
            <Label>Great Count</Label>
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
            <Label>Low Unit Price</Label>
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
            <Label>Great Unit Price</Label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={condition.gtUnitPrice ?? ''}
              onChange={(e) =>
                onChangeConfig('gtUnitPrice', e.target.value)
              }
            />
          </div>

          {/* Sub UOM Type */}
          <div className="space-y-1">
            <Label htmlFor={`sub-uom-${condition.id}`}>Sub uom type</Label>
            <Select
              value={condition.subUomType || ''}
              onValueChange={(v) =>
                onChangeConfig('subUomType', v)
              }
            >
              <Select.Trigger id={`sub-uom-${condition.id}`}>
                <Select.Value placeholder="Select option" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="">Not use</Select.Item>
                <Select.Item value="lt">Low than count</Select.Item>
                <Select.Item value="gte">Greater, equal than count</Select.Item>
              </Select.Content>
            </Select>
          </div>
        </div>
      </div>

      {/* BRANCH & DEPARTMENT */}
      <div className="rounded border p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor={`branch-${condition.id}`}>Set branch</Label>
            <Select
              value={condition.branchId || ''}
              onValueChange={(v) =>
                onChangeConfig('branchId', v)
              }
            >
              <Select.Trigger id={`branch-${condition.id}`}>
                <Select.Value placeholder="Choose branch" />
              </Select.Trigger>
              <Select.Content />
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor={`department-${condition.id}`}>Set department</Label>
            <Select
              value={condition.departmentId || ''}
              onValueChange={(v) =>
                onChangeConfig('departmentId', v)
              }
            >
              <Select.Trigger id={`department-${condition.id}`}>
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
