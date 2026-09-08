import { IconFilePlus } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useDocuments } from '../hooks/useDocuments';
import { documentsViewAtom } from '../states/documentsViewState';
import { IDocument } from '../types';
import { DocumentsGrid } from './DocumentsGrid';
import { DocumentsList } from './DocumentsList';
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
  const { documents, loading } = useDocuments();
  const Component = DOCUMENTS_VIEW_TYPES[viewType] ?? DocumentsList;
  const { t } = useTranslation('documents');

  if (!loading && documents.length === 0) {
    return (
      <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center px-8 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
          <IconFilePlus size={28} className="text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">{t('no-document-title')}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          {t('no-document-description')}
        </p>
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
