import { IconListDetails } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProductsSetConditions } from '@/products/hooks/useProductsSetConditions';
import { ConditionModeToggle } from '@/products/settings/components/productsConfig/condition/ConditionModeToggle';
import { ProductConditionCodesMode } from '@/products/settings/components/productsConfig/condition/types';
import { useProductConditions } from '@/products/settings/hooks/useProductConditions';

export const ProductsSetConditionsTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (content: string) => void;
}) => {
  const { t } = useTranslation('product');
  return (
    <Command.ActionItem
      icon={IconListDetails}
      label={t('conditions', 'Conditions')}
      onSelect={() => setCurrentContent('conditions')}
    />
  );
};

export const ProductsSetConditionsContent = ({
  productIds,
  setOpen,
}: {
  productIds: string[];
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('product');
  const [mode, setMode] = useState<ProductConditionCodesMode>('add');
  const { conditions, loading } = useProductConditions();
  const { apply, loading: saving } = useProductsSetConditions(() =>
    setOpen(false),
  );

  return (
    <Command>
      <div className="p-2 border-b">
        <ConditionModeToggle value={mode} onChange={setMode} />
      </div>
      <Command.Input placeholder={t('conditions', 'Conditions')} />
      <Command.List>
        <Command.Empty>
          {loading
            ? t('loading', 'Loading...')
            : t('no-conditions', 'No conditions yet')}
        </Command.Empty>
        {conditions.map((condition) => (
          <Command.Item
            key={condition._id}
            value={`${condition.code} ${condition.name}`}
            disabled={saving}
            onSelect={() => apply(productIds, condition.code, mode)}
          >
            {condition.name}
            <span className="ml-auto text-muted-foreground">
              {condition.code}
            </span>
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
