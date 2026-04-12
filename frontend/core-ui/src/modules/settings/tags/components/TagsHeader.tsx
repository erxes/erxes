import { DraftState } from '@/settings/tags/types/tagTree';
import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Can } from 'ui-modules';

interface TagsHeaderProps {
  draft: DraftState | null;
  onAddGroup: () => void;
  onAddTag: () => void;
}

export const TagsHeader = ({ draft, onAddGroup, onAddTag }: TagsHeaderProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'tags' });

  return (
    <div className="flex items-center justify-between px-3 pt-3 pb-1">
      <div>
        <h2 className="text-sm font-semibold">{t('workspace-tags')}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t('workspace-tags-description') ||
            'Organize, group, and manage workspace tags'}
        </p>
      </div>
      <Can action="tagsCreate">
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onAddGroup}
            disabled={!!draft}
          >
            Add Group
          </Button>
          <Button size="sm" onClick={onAddTag} disabled={!!draft}>
            <IconPlus className="size-4" />
            Add Tag
          </Button>
        </div>
      </Can>
    </div>
  );
};
