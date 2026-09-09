import { IconFilePlus, IconFilterOff } from '@tabler/icons-react';
import { Button, Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type DocumentsEmptyStateProps = Readonly<{
  hasFilters: boolean;
  onClearFilters: () => void;
}>;

/** Renders the document empty state and lets users clear active filters. */
export function DocumentsEmptyState({
  hasFilters,
  onClearFilters,
}: DocumentsEmptyStateProps) {
  const { t } = useTranslation('documents');

  return (
    <Empty className="h-full min-h-[400px] border-0 bg-transparent">
      <Empty.Header>
        <Empty.Media variant="icon">
          {hasFilters ? <IconFilterOff /> : <IconFilePlus />}
        </Empty.Media>
        <Empty.Title>
          {hasFilters ? t('filtered-empty-title') : t('no-document-title')}
        </Empty.Title>
        <Empty.Description>
          {hasFilters
            ? t('filtered-empty-description')
            : t('no-document-description')}
        </Empty.Description>
      </Empty.Header>
      {hasFilters && (
        <Empty.Content>
          <Button variant="outline" onClick={onClearFilters}>
            {t('clear-filters')}
          </Button>
        </Empty.Content>
      )}
    </Empty>
  );
}
