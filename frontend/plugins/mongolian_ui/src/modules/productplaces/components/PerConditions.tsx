import { Button, Input, Label, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IconTrash } from '@tabler/icons-react';
import {
  SelectBranches,
  SelectCategory,
  SelectDepartments,
  SelectProduct,
  SelectSegment,
  SelectTags,
} from 'ui-modules';

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
              {t('product-category')}
            </Label>
            <SelectCategory
              value={condition.productCategoryIds ?? []}
              onValueChange={(ids) => onChangeConfig('productCategoryIds', ids)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('exclude-categories')}
            </Label>
            <SelectCategory
              value={condition.excludeCategoryIds ?? []}
              onValueChange={(ids) => onChangeConfig('excludeCategoryIds', ids)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('product-tags')}
            </Label>
            <SelectTags
              mode="multiple"
              tagType="core:product"
              value={condition.productTagIds ?? []}
              onValueChange={(ids) =>
                onChangeConfig(
                  'productTagIds',
                  Array.isArray(ids) ? ids : [ids],
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('exclude-tags')}
            </Label>
            <SelectTags
              mode="multiple"
              tagType="core:product"
              value={condition.excludeTagIds ?? []}
              onValueChange={(ids) =>
                onChangeConfig(
                  'excludeTagIds',
                  Array.isArray(ids) ? ids : [ids],
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('exclude-products')}
            </Label>
            <SelectProduct
              mode="multiple"
              value={condition.excludeProductIds ?? []}
              onValueChange={(ids) =>
                onChangeConfig(
                  'excludeProductIds',
                  Array.isArray(ids) ? ids : [ids],
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('segment')}
            </Label>
            <SelectSegment
              contentType="core:products.products"
              mode="multiple"
              selected={
                Array.isArray(condition.segmentIds)
                  ? condition.segmentIds
                  : condition.segmentId
                    ? [condition.segmentId]
                    : []
              }
              onSelect={(segmentIds) =>
                onChangeConfig(
                  'segmentIds',
                  Array.isArray(segmentIds) ? segmentIds : [],
                )
              }
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('low-count')}
            </Label>
            <Input
              type="number"
              value={condition.ltCount ?? ''}
              onChange={(e) => onNumberChange('ltCount', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('great-count')}
            </Label>
            <Input
              type="number"
              value={condition.gtCount ?? ''}
              onChange={(e) => onNumberChange('gtCount', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('low-unit-price')}
            </Label>
            <Input
              type="number"
              value={condition.ltUnitPrice ?? ''}
              onChange={(e) => onNumberChange('ltUnitPrice', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('great-unit-price')}
            </Label>
            <Input
              type="number"
              value={condition.gtUnitPrice ?? ''}
              onChange={(e) => onNumberChange('gtUnitPrice', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('sub-uom-type')}
            </Label>
            <Select
              value={condition.subUomType ?? ''}
              onValueChange={(v) =>
                onChangeConfig('subUomType', v === CLEAR_VALUE ? undefined : v)
              }
            >
              <Select.Trigger>
                <Select.Value placeholder={t('not-use')} />
              </Select.Trigger>

              <Select.Content>
                <Select.Item value={CLEAR_VALUE}>{t('not-use')}</Select.Item>
                <Select.Item value="lt">{t('low-than-count')}</Select.Item>
                <Select.Item value="gte">
                  {t('greater-equal-than-count')}
                </Select.Item>
              </Select.Content>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded border p-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('set-branch')}
            </Label>
            <SelectBranches.Root
              value={condition.branchId || ''}
              onValueChange={(branchId) =>
                onChangeConfig(
                  'branchId',
                  typeof branchId === 'string' ? branchId : '',
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">
              {t('set-department')}
            </Label>
            <SelectDepartments.Root
              value={condition.departmentId || ''}
              onValueChange={(departmentId) =>
                onChangeConfig(
                  'departmentId',
                  typeof departmentId === 'string' ? departmentId : '',
                )
              }
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
            + {t('add-condition')}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-4"
          onClick={() => onRemove(condition.id)}
        >
          <IconTrash size={16} className="" />
          {t('delete')}
        </Button>
      </div>
    </div>
  );
};

export default PerConditions;
