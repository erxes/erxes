import { IconFilePlus, IconFilterOff } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Button, useMultiQueryState } from 'erxes-ui';
import { useDocuments } from '../hooks/useDocuments';
import { documentsViewAtom } from '../states/documentsViewState';
import { DocumentFilterState, IDocument } from '../types';
import { DocumentsGrid } from './DocumentsGrid';
import { DocumentsList } from './DocumentsList';
import { DocumentsErrorState } from './DocumentsErrorState';
import { DocumentsRecordTable } from './list/DocumentsRecordTable';

type Props = {
  viewType: 'list' | 'grid';
};

const DOCUMENTS_VIEW_TYPES: Record<
  string,
  React.ComponentType<{ documents: IDocument[] }>
> = {
  grid: DocumentsGrid,
  list: DocumentsList,
};

function DocumentsContent({ viewType }: Props) {
  const { documents, hasError, loading, refetch } = useDocuments();
  const [filters, setFilters] = useMultiQueryState<DocumentFilterState>([
    'createdAt',
    'createdBy',
    'searchValue',
    'tagIds',
  ]);
  const Component = DOCUMENTS_VIEW_TYPES[viewType] ?? DocumentsList;
  const { t } = useTranslation('documents');
  const hasFilters = Object.values(filters).some((value) => value !== null);

  if (hasError) {
    return <DocumentsErrorState onRetry={() => void refetch()} />;
  }

  if (viewType === 'grid' && !loading && documents.length === 0) {
    return (
      <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center px-8 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
          {hasFilters ? (
            <IconFilterOff size={28} className="text-muted-foreground" />
          ) : (
            <IconFilePlus size={28} className="text-muted-foreground" />
          )}
        </div>
        <h3 className="mb-1 text-lg font-semibold">
          {hasFilters ? 'No documents found' : t('no-document-title')}
        </h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          {hasFilters
            ? 'Try changing or clearing your filters.'
            : t('no-document-description')}
        </p>
        {hasFilters && (
          <Button
            variant="outline"
            className="mt-4"
            onClick={() =>
              setFilters({
                createdAt: null,
                createdBy: null,
                searchValue: null,
                tagIds: null,
              })
            }
          >
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <Component documents={documents} />
    </div>
  );
}

export function Documents({ viewType }: Props) {
  const documentsView = useAtomValue(documentsViewAtom);

  if (viewType === 'grid' && documentsView === 'list') {
    return <DocumentsRecordTable />;
  }

  return <DocumentsContent viewType={viewType} />;
}
