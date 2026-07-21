import { Button, Input, Label, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IconTrash } from '@tabler/icons-react';
import SelectDepartments from '../selects/SelectDepartments';
import SelectBranches from '../selects/SelectBranches';
import SelectProducts from '../selects/SelectProducts';
import SelectProductTags from '../selects/SelectProductTags';
import SelectSegments from '../selects/SelectSegments';
import { SelectCategory } from 'ui-modules';

type Props = {
  condition: any;
  onChange: (id: string, condition: any) => void;
  onRemove: (id: string) => void;
  onAddCondition?: () => void;
};

const CLEAR_VALUE = '__clear__';

const PerConditions = ({
  condition,
  onChange,
  onRemove,
  onAddCondition,
}: Props) => {
  const { t } = useTranslation('mongolian');
  const onChangeConfig = (key: string, value: any) => {
    onChange(condition.id, { ...condition, [key]: value });
  };

  const onNumberChange = (key: string, value: string) => {
    onChangeConfig(key, value === '' ? undefined : Number(value));
  };

  return (
    <div className="rounded border p-4 space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('product-category', 'Product Category')}
            </Label>
            <SelectCategory
              value={condition.productCategoryIds ?? []}
              onValueChange={(ids) => onChangeConfig('productCategoryIds', ids)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('exclude-categories', 'Exclude Categories')}
            </Label>
            <SelectCategory
              value={condition.excludeCategoryIds ?? []}
              onValueChange={(ids) => onChangeConfig('excludeCategoryIds', ids)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('product-tags', 'Product Tags')}
            </Label>
            <SelectProductTags
              value={condition.productTagIds ?? []}
              onValueChange={(ids) => onChangeConfig('productTagIds', ids)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('exclude-tags', 'Exclude Tags')}
            </Label>
            <SelectProductTags
              value={condition.excludeTagIds ?? []}
              onValueChange={(ids) => onChangeConfig('excludeTagIds', ids)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('exclude-products', 'Exclude Products')}
            </Label>
            <SelectProducts
              value={condition.excludeProductIds ?? []}
              onValueChange={(ids) => onChangeConfig('excludeProductIds', ids)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('segment', 'Segment')}
            </Label>
            <SelectSegments
              contentTypes={['core:product']}
              value={condition.segmentId || ''}
              onValueChange={(segmentId) =>
                onChangeConfig('segmentId', segmentId)
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('low-count', 'Low Count')}
            </Label>
            <Input
              type="number"
              value={condition.ltCount ?? ''}
              onChange={(e) => onNumberChange('ltCount', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('great-count', 'Great Count')}
            </Label>
            <Input
              type="number"
              value={condition.gtCount ?? ''}
              onChange={(e) => onNumberChange('gtCount', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('low-unit-price', 'Low Unit Price')}
            </Label>
            <Input
              type="number"
              value={condition.ltUnitPrice ?? ''}
              onChange={(e) => onNumberChange('ltUnitPrice', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('great-unit-price', 'Great Unit Price')}
            </Label>
            <Input
              type="number"
              value={condition.gtUnitPrice ?? ''}
              onChange={(e) => onNumberChange('gtUnitPrice', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('sub-uom-type', 'Sub Uom Type')}
            </Label>
            <Select
              value={condition.subUomType ?? ''}
              onValueChange={(v) =>
                onChangeConfig('subUomType', v === CLEAR_VALUE ? undefined : v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder={t('not-use', 'Not use')} />
              </Select.Trigger>

              <Select.Content>
                <Select.Item value={CLEAR_VALUE}>{t('not-use', 'Not use')}</Select.Item>
                <Select.Item value="lt">{t('low-than-count', 'Low than count')}</Select.Item>
                <Select.Item value="gte">{t('greater-equal-than-count', 'Greater, equal than count')}</Select.Item>
              </Select.Content>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded border p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('set-branch', 'Set Branch')}
            </Label>
            <SelectBranches
              value={condition.branchId || ''}
              onChange={(branchId) => onChangeConfig('branchId', branchId)}
              ids={[]}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('set-department', 'Set Department')}
            </Label>
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

      <div className="flex justify-end gap-2">
        {onAddCondition && (
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-4"
            onClick={onAddCondition}
          >
            + {t('add-condition', 'Add Condition')}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-4"
          onClick={() => onRemove(condition.id)}
        >
          <IconTrash size={16} className="" />
          {t('delete', 'Delete')}
        </Button>
      </div>
    </div>
  );
};

export default PerConditions;
