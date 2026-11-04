import { IconTags } from '@tabler/icons-react';
import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TagsSelect } from 'ui-modules';

const VISIBLE_TAG_COUNT = 2;

export const RecordTagsValue = ({ count }: { count: number }) => {
  const { t } = useTranslation('operation');

  if (!count) {
    return (
      <span className="flex items-center gap-2 text-muted-foreground">
        <IconTags className="size-4 shrink-0" aria-hidden="true" />
        {t('add-tags', 'Add tags')}
      </span>
    );
  }

  return (
    <>
      <div className="flex min-w-0 items-center gap-1 overflow-hidden">
        <TagsSelect.SelectedList className="min-w-0 max-w-24 [&:nth-child(n+3)]:hidden [&>div]:min-w-0 [&>svg]:hidden" />
      </div>
      {count > VISIBLE_TAG_COUNT && (
        <Badge variant="secondary" className="shrink-0">
          +{count - VISIBLE_TAG_COUNT}
        </Badge>
      )}
    </>
  );
};
