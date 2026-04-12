import { DraftState } from '@/settings/tags/types/tagTree';
import { IconPlus } from '@tabler/icons-react';
import { Button, Kbd, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can, getTagTypeDescription, useTagTypes } from 'ui-modules';

interface TagsHeaderProps {
  draft: DraftState | null;
  onAddGroup: () => void;
  onAddTag: () => void;
}

export const TagsHeader = ({
  draft,
  onAddGroup,
  onAddTag,
}: TagsHeaderProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'tags' });
  const [type] = useQueryState<string>('tagType');
  const { types } = useTagTypes();
  const typeLabel = getTagTypeDescription({ type: type ?? null, tagTypes: types });

  return (
    <div className="flex items-center justify-between px-3 pt-3 pb-1">
      <div>
        <h2 className="text-sm font-semibold">{typeLabel} {t('_')}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t('workspace-tags-description')}
        </p>
      </div>
      <Can action="tagsCreate">
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Button
            variant="outline"
            onClick={onAddGroup}
            disabled={draft?.kind === 'tag'}
          >
            {t('add-group')}
            <Kbd variant="foreground">G</Kbd>
          </Button>
          <Button onClick={onAddTag} disabled={draft?.kind === 'group'}>
            <IconPlus className="size-4" />
            {t('add-tag')}
            <Kbd>C</Kbd>
          </Button>
        </div>
      </Can>
    </div>
  );
};
