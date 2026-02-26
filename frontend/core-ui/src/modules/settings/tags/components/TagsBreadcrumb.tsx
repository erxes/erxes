import { IconTagsFilled, IconInfoCircle } from '@tabler/icons-react';
import { Button, useQueryState, Tooltip } from 'erxes-ui';
import { useTagTypes, getTagTypeDescription } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export const TagsBreadcrumb = () => {
  const { t } = useTranslation('settings');
  const [type] = useQueryState<string>('tagType');
  const { types } = useTagTypes();
  const helpUrl =
    'https://erxes.io/guides/68ef769c1a9ddbd30aec6c35/6992b1df5cac46b2ff76afbb';
  return (
    <div className="flex gap-1 items-center">
      <Button variant="ghost" className="font-semibold">
        <IconTagsFilled className="size-4 text-accent-foreground" />
        {getTagTypeDescription({ type, tagTypes: types })}
        {' tags'}
      </Button>
      <Tooltip>
        <Tooltip.Trigger aria-label={t('tags.workspace-description')}>
          <Link to={helpUrl} target="_blank">
            <IconInfoCircle className="size-4 text-accent-foreground" />
          </Link>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>Create and organize labels for categorization</p>
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
};
