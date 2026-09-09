import { useAtomValue } from 'jotai';
import { useMultiQueryState } from 'erxes-ui';
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

/** Renders a document collection with loading, error, and empty states. */
function DocumentsContent({
  hasFilters,
  onClearFilters,
  viewType,
}: DocumentsContentProps) {
  const { documents, hasError, loading, refetch } = useDocuments();
  const Component = DOCUMENTS_VIEW_TYPES[viewType] ?? DocumentsList;

  if (hasError) {
    return <DocumentsErrorState onRetry={refetch} />;
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

  /** Clears every query parameter that filters the documents query. */
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
