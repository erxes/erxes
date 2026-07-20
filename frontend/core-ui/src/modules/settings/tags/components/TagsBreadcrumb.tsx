import { IconTagsFilled, IconInfoCircle } from '@tabler/icons-react';
import { Button, useQueryState, Tooltip } from 'erxes-ui';
import { useTagTypes, getTagTypeDescription } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const TagsBreadcrumb = () => {
  const { t } = useTranslation('settings');
  const [type] = useQueryState<string>('tagType');
  const { types } = useTagTypes();
  return (
    <div className="flex gap-1 items-center">
      <Button variant="ghost" className="font-semibold">
        <IconTagsFilled className="size-4 text-accent-foreground" />
        {getTagTypeDescription({ type, tagTypes: types })}
        {' tags'}
      </Button>
      <Tooltip>
        <Tooltip.Trigger aria-label={t('tags.workspace-description', 'Workspace tags are shared tags that can be used across all tag types.')}>
          <IconInfoCircle className="size-4 text-accent-foreground" />
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>{t('tags.workspace-description', 'Workspace tags are shared tags that can be used across all tag types.')}</p>
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
};
