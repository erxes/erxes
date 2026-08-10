import { IconFilePlus } from '@tabler/icons-react';
import { useDocuments } from '../hooks/useDocuments';
import { DocumentsGrid } from './DocumentsGrid';
import { DocumentsList } from './DocumentsList';
import { useTranslation } from 'react-i18next';

type Props = {
  viewType: 'list' | 'grid';
};

const DOCUMENTS_VIEW_TYPES: Record<
  string,
  React.ComponentType<{ documents: any[] }>
> = {
  grid: DocumentsGrid,
  list: DocumentsList,
};

export const Documents = ({ viewType }: Props) => {
  const { documents, loading } = useDocuments();
  const Component = DOCUMENTS_VIEW_TYPES[viewType] ?? DocumentsList;
  const { t } = useTranslation('documents');

  return (
    <div className="h-full overflow-y-auto">
      <Component documents={documents} />

        {!loading && documents?.length === 0 && (
          <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center px-8 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
              <IconFilePlus size={28} className="text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-lg font-semibold">
              {t('no-document-title')}
            </h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              {t('no-document-description')}
            </p>
          </div>
      )}
    </div>
  );
};
