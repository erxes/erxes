import { IconFilePlus, IconFilterOff } from '@tabler/icons-react';
import { Button, Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type DocumentsEmptyStateProps = {
  hasFilters: boolean;
  onClearFilters: () => void;
};

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
          {hasFilters ? 'No documents found' : t('no-document-title')}
        </Empty.Title>
        <Empty.Description>
          {hasFilters
            ? 'Try changing or clearing your filters.'
            : t('no-document-description')}
        </Empty.Description>
      </Empty.Header>
      {hasFilters && (
        <Empty.Content>
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        </Empty.Content>
      )}
    </Empty>
  );
}
