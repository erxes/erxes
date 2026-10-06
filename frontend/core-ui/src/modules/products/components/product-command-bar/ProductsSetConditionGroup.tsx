import { IconListDetails } from '@tabler/icons-react';
import { Command } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useProductsSetConditionGroup } from '@/products/hooks/useProductsSetConditionGroup';
import { useProductConditionGroups } from '@/products/settings/hooks/useProductConditionGroups';

export const ProductsSetConditionGroupTrigger = ({
  setCurrentContent,
}: {
  setCurrentContent: (content: string) => void;
}) => {
  const { t } = useTranslation('product');
  return (
    <Command.ActionItem
      icon={IconListDetails}
      label={t('condition-group', 'Condition group')}
      onSelect={() => setCurrentContent('conditionGroup')}
    />
  );
};

export const ProductsSetConditionGroupContent = ({
  productIds,
  setOpen,
}: {
  productIds: string[];
  setOpen: (open: boolean) => void;
}) => {
  const { t } = useTranslation('product');
  const { conditionGroups, loading } = useProductConditionGroups();
  const { apply, loading: saving } = useProductsSetConditionGroup(() =>
    setOpen(false),
  );

  return (
    <Command>
      <Command.Input placeholder={t('condition-group', 'Condition group')} />
      <Command.List>
        <Command.Empty>
          {loading
            ? t('loading', 'Loading...')
            : t('no-condition-groups', 'No condition groups yet')}
        </Command.Empty>
        <Command.Item
          value="__none__"
          disabled={saving}
          onSelect={() => apply(productIds, null)}
        >
          {t('no-condition-group', 'None (clear)')}
        </Command.Item>
        {conditionGroups.map((group) => (
          <Command.Item
            key={group._id}
            value={group.name}
            disabled={saving}
            onSelect={() => apply(productIds, group._id)}
          >
            {group.name}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
