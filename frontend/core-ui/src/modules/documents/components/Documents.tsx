import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import {
  Button,
  EnumCursorDirection,
  Spinner,
  useMultiQueryState,
} from 'erxes-ui';
import { useDocuments } from '../hooks/useDocuments';
import { documentsViewAtom } from '../states/documentsViewState';
import { DocumentFilterState, IDocument } from '../types';
import { DocumentsEmptyState } from './DocumentsEmptyState';
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

type DocumentsContentProps = Props & {
  hasFilters: boolean;
  onClearFilters: () => void;
};

function DocumentsContent({
  hasFilters,
  onClearFilters,
  viewType,
}: DocumentsContentProps) {
  const { documents, hasError, loading, refetch, pageInfo, handleFetchMore } =
    useDocuments();
  const Component = DOCUMENTS_VIEW_TYPES[viewType] ?? DocumentsList;
  const { t } = useTranslation('documents');

  if (hasError) {
    return (
      <DocumentsErrorState
        onRetry={() => {
          void refetch().catch(() => undefined);
        }}
      />
    );
  }

  if (loading && !documents.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (viewType === 'grid' && !loading && documents.length === 0) {
    return (
      <DocumentsEmptyState
        hasFilters={hasFilters}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <Component documents={documents} />
      {pageInfo?.hasNextPage && (
        <div className="flex justify-center p-4">
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => {
              void handleFetchMore({ direction: EnumCursorDirection.FORWARD });
            }}
          >
            {loading ? t('loading') : t('load-more-documents')}
          </Button>
        </div>
      )}
    </div>
  );
}

export function Documents({ viewType }: Props) {
  const documentsView = useAtomValue(documentsViewAtom);
  const [filters, setFilters] = useMultiQueryState<DocumentFilterState>([
    'contentType',
    'createdAt',
    'createdBy',
    'searchValue',
    'tagIds',
  ]);
  const hasFilters = Object.values(filters).some((value) => value !== null);

  const clearFilters = () =>
    setFilters({
      contentType: null,
      createdAt: null,
      createdBy: null,
      searchValue: null,
      tagIds: null,
    });

  if (viewType === 'grid' && documentsView === 'list') {
    return (
      <DocumentsRecordTable
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
      />
    );
  }

  return (
    <DocumentsContent
      viewType={viewType}
      hasFilters={hasFilters}
      onClearFilters={clearFilters}
    />
  );
}
