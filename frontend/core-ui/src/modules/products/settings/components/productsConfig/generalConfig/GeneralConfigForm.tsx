import {
  Button,
  Checkbox,
  InfoCard,
  Label,
  Skeleton,
  useToast,
} from 'erxes-ui';
import { Can, SelectUOM } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { useProductsConfigs } from '@/products/settings/hooks/useProductsConfigs';
import { useProductsConfigsUpdate } from '@/products/settings/hooks/useProductsConfigsUpdate';
import { IconCheck } from '@tabler/icons-react';

export const GeneralConfigForm = ({ onEdit }: { onEdit?: () => void }) => {
  const requireUomId = useId();
  const { t } = useTranslation('product', {
    keyPrefix: 'general-config-form',
  });

  const { toast } = useToast();
  const [isRequireUOM, setIsRequireUOM] = useState<boolean>(false);
  const [defaultUom, setDefaultUom] = useState<string>('');
  const { configs, loading: configsLoading } = useProductsConfigs();
  const { productsConfigsUpdate, loading: updating } =
    useProductsConfigsUpdate();

  const initialValues = useMemo(() => {
    const isRequireUOMConfig = configs.find(
      (config) => config.code === 'isRequireUOM',
    );
    const defaultUOMConfig = configs.find(
      (config) => config.code === 'defaultUOM',
    );
    return {
      isRequireUOM: Boolean(isRequireUOMConfig?.value),
      defaultUom: String(defaultUOMConfig?.value ?? ''),
    };
  }, [configs]);

  useEffect(() => {
    if (configs.length > 0) {
      setIsRequireUOM(initialValues.isRequireUOM);
      setDefaultUom(initialValues.defaultUom);
    }
  }, [initialValues.isRequireUOM, initialValues.defaultUom, configs.length]);

  const hasChanges =
    isRequireUOM !== initialValues.isRequireUOM ||
    defaultUom !== initialValues.defaultUom;

  const handleSave = useCallback(async () => {
    try {
      await productsConfigsUpdate({
        variables: {
          configsMap: {
            isRequireUOM,
            defaultUOM: defaultUom || undefined,
          },
        },
      });
      toast({
        title: t('saved', 'General configuration updated successfully.'),
        variant: 'success',
      });
    } catch {
      toast({ title: t('error', 'Update Failed'), variant: 'destructive' });
    }
  }, [productsConfigsUpdate, isRequireUOM, defaultUom, toast, t]);

  if (configsLoading) {
    return (
      <div className="space-y-6">
        <InfoCard title={t('general-settings')}>
          <InfoCard.Content>
            <Skeleton className="w-full h-36" />
          </InfoCard.Content>
        </InfoCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InfoCard title={t('general-settings')}>
        <InfoCard.Content>
          <div className="flex gap-2 items-center">
            <Checkbox
              disabled={Boolean(onEdit)}
              id={requireUomId}
              checked={isRequireUOM}
              onCheckedChange={(checked) =>
                setIsRequireUOM(checked === true || checked === 'indeterminate')
              }
            />

            <Label htmlFor={requireUomId} className="cursor-pointer">
              {t('is-required-uom')}
            </Label>
          </div>

          {isRequireUOM && (
            <div className="space-y-2">
              <Label>{t('default-uom')}</Label>
              {onEdit ? (
                <div className="text-sm">{defaultUom || '—'}</div>
              ) : (
                <SelectUOM value={defaultUom} onValueChange={setDefaultUom} />
              )}
            </div>
          )}

          {onEdit ? (
            <Can action="productsConfigsManage">
              <Button onClick={onEdit}>{t('edit', 'Edit')}</Button>
            </Can>
          ) : (
            hasChanges && (
              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={updating}>
                  <IconCheck />
                  {updating ? t('saving') : t('save')}
                </Button>
              </div>
            )
          )}
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
