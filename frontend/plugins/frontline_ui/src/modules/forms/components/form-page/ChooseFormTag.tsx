import { Button, Skeleton, TextOverflowTooltip, useQueryState } from 'erxes-ui';
import { IconCheck } from '@tabler/icons-react';
import { ITag, useTags } from 'ui-modules';
import { useFormsFilterCounts } from '@/forms/hooks/useFormsFilterCounts';
import { useTranslation } from 'react-i18next';

const FORM_TAG_TYPE = 'frontline:form';

export const ChooseFormTag = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.forms' });
  const { tags, loading } = useTags({
    variables: { type: FORM_TAG_TYPE, limit: 100 },
    fetchPolicy: 'cache-and-network',
  });
  const { byTag } = useFormsFilterCounts();

  if (loading && !tags?.length)
    return (
      <div className="flex flex-col gap-1">
        <Skeleton className="w-32 h-4 mt-1" />
        <Skeleton className="w-36 h-4 mt-1" />
        <Skeleton className="w-32 h-4 mt-1" />
      </div>
    );

  const visibleTags = tags?.filter((tag) => !tag.isGroup);

  if (!visibleTags?.length)
    return (
      <div className="text-sm text-accent-foreground ml-3 my-4">
        {t('no-tags-found')}
      </div>
    );

  return visibleTags.map((tag) => (
    <FormTagItem key={tag._id} tag={tag} count={byTag[tag._id] ?? 0} />
  ));
};

const FormTagItem = ({ tag, count }: { tag: ITag; count: number }) => {
  const [tagId, setTagId] = useQueryState<string>('tagId');

  const isActive = tagId === tag._id;

  const handleClick = () => {
    setTagId(isActive ? null : tag._id);
  };

  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className="justify-start relative overflow-hidden text-left flex-auto p-2"
      onClick={handleClick}
    >
      {isActive ? (
        <IconCheck />
      ) : (
        <span
          className="size-2 rounded-full shrink-0 bg-muted-foreground"
          style={tag.colorCode ? { backgroundColor: tag.colorCode } : undefined}
        />
      )}
      <TextOverflowTooltip className="flex-1 min-w-0" value={tag.name} />
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {count}
      </span>
    </Button>
  );
};
