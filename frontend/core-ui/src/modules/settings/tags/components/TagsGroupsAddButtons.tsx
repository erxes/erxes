import { Button } from 'erxes-ui';
import { useTagContext } from '@/settings/tags/providers/TagProvider';
import { useTranslation } from 'react-i18next';

export const TagsGroupsAddButtons = () => {
  const { startAddingTag, startAddingGroup } = useTagContext();
  const { t } = useTranslation('settings', {
    keyPrefix: 'tags',
  });
  return (
    <div className="flex gap-2">
      <Button onClick={startAddingGroup} variant="outline">
        {t('add-group')}
      </Button>
      <Button onClick={startAddingTag}>{t('add-tag')}</Button>
    </div>
  );
};
