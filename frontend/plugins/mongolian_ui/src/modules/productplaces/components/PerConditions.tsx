import { Button, Select } from 'erxes-ui';
import SelectBranches from '../selects/SelectBranches';
import SelectDepartments from '../selects/SelectDepartments';
import SelectProductCategories from '../selects/SelectProductCategories';
import SelectProductTags from '../selects/SelectTags';
import SelectProducts from '../selects/SelectProducts';
import SelectSegments from '../selects/SelectSegments';

type Props = {
  condition: any;
  onChange: (id: string, condition: any) => void;
  onRemove: (id: string) => void;
};

const CLEAR_VALUE = '__clear__';

const PerConditions = ({ condition, onChange, onRemove }: Props) => {
  const onChangeConfig = (key: string, value: any) => {
    onChange(condition.id, { ...condition, [key]: value });
  };

  const onNumberChange = (key: string, value: string) => {
    onChangeConfig(key, value === '' ? undefined : Number(value));
  };

  return (
    <div className="rounded border p-4 space-y-6 bg-white">
      <div className="grid grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Product Category</label>
            <SelectProductCategories
              value={condition.productCategoryIds ?? []}
              onChange={(ids) => onChangeConfig('productCategoryIds', ids)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Exclude categories</label>
            <SelectProductCategories
              value={condition.excludeCategoryIds ?? []}
              onChange={(ids) => onChangeConfig('excludeCategoryIds', ids)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Product Tags</label>
            <SelectProductTags
              value={condition.productTagIds ?? []}
              onChange={(ids) => onChangeConfig('productTagIds', ids)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Exclude tags</label>
            <SelectProductTags
              value={condition.excludeTagIds ?? []}
              onChange={(ids) => onChangeConfig('excludeTagIds', ids)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Exclude products</label>
            <SelectProducts
              value={condition.excludeProductIds ?? []}
              onChange={(ids) => onChangeConfig('excludeProductIds', ids)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Segment</label>
            <SelectSegments
              contentTypes={['core:product']}
              value={condition.segmentIds?.[0] || undefined}
              onChange={(id) => onChangeConfig('segmentIds', id ? [id] : [])}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Low Count</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={condition.ltCount ?? ''}
              onChange={(e) => onNumberChange('ltCount', e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Great Count</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={condition.gtCount ?? ''}
              onChange={(e) => onNumberChange('gtCount', e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Low Unit Price</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={condition.ltUnitPrice ?? ''}
              onChange={(e) => onNumberChange('ltUnitPrice', e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Great Unit Price</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={condition.gtUnitPrice ?? ''}
              onChange={(e) => onNumberChange('gtUnitPrice', e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Sub uom type</label>
            <Select
              value={condition.subUomType ?? ''}
              onValueChange={(v) =>
                onChangeConfig('subUomType', v === CLEAR_VALUE ? undefined : v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder="Not use" />
              </Select.Trigger>

              <Select.Content>
                <Select.Item value={CLEAR_VALUE}>Not use</Select.Item>
                <Select.Item value="lt">Low than count</Select.Item>
                <Select.Item value="gte">Greater, equal than count</Select.Item>
              </Select.Content>
            </Select>
          </div>
        </div>
      </div>

      {/* Branch / Department */}
      <div className="rounded border p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Set branch</label>
            <SelectBranches
              value={condition.branchId || ''}
              onChange={(branchId) => onChangeConfig('branchId', branchId)}
              ids={[]}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Set department</label>
            <SelectDepartments
              value={condition.departmentId || ''}
              onChange={(departmentId) =>
                onChangeConfig('departmentId', departmentId)
              }
              ids={[]}
            />
          </div>
        </div>
      </div>

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
