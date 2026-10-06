import { Button, Dialog, Label, Select } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategoryConditionGroup } from '@/products/product-category/hooks/useCategoryConditionGroup';
import { useProductConditionGroups } from '@/products/settings/hooks/useProductConditionGroups';

const NONE = '__none__';

// Writes the group onto the category's products once; later products are set on their own.
export const CategoryConditionGroupDialog = ({
  categoryId,
  categoryName,
  open,
  onOpenChange,
}: {
  categoryId: string;
  categoryName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('product');
  const [groupId, setGroupId] = useState(NONE);
  const { conditionGroups, loading } = useProductConditionGroups();
  const { apply, loading: saving } = useCategoryConditionGroup(() =>
    onOpenChange(false),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>
            {t('set-condition-group', 'Set condition group')} — {categoryName}
          </Dialog.Title>
          <Dialog.Description>
            {t(
              'set-condition-group-description',
              'Every product in this category and its subcategories gets this group now. Products added later are not changed.',
            )}
          </Dialog.Description>
        </Dialog.Header>
        <div className="space-y-2">
          <Label>{t('condition-group', 'Condition group')}</Label>
          <Select value={groupId} onValueChange={setGroupId} disabled={loading}>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value={NONE}>
                {t('no-condition-group', 'None (clear)')}
              </Select.Item>
              {conditionGroups.map((group) => (
                <Select.Item key={group._id} value={group._id}>
                  {group.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <Dialog.Footer>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            disabled={saving}
            onClick={() => apply(categoryId, groupId === NONE ? null : groupId)}
          >
            {t('save', 'Save')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
