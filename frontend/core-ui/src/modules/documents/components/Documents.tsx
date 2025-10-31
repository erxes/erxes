import { PageSubHeader, ScrollArea } from 'erxes-ui';
import { useDocuments } from '../hooks/useDocuments';
import { DocumentsFilter } from './DocumentsFilter';
import { DocumentsGrid } from './DocumentsGrid';
import { DocumentsList } from './DocumentsList';
import { IconGitBranch } from '@tabler/icons-react';

type Props = {
  viewType: 'list' | 'grid';
  showFilter?: boolean;
};

const DOCUMENTS_VIEW_TYPES: Record<
  string,
  React.ComponentType<{ documents: any[] }>
> = {
  grid: DocumentsGrid,
  list: DocumentsList,
};

export const Documents = ({ viewType, showFilter = true }: Props) => {
  const { documents, loading } = useDocuments();
  const Component = DOCUMENTS_VIEW_TYPES[viewType] ?? DocumentsList;

  return (
    <div className="flex flex-col h-full border-r">
      {showFilter && (
        <PageSubHeader>
          <DocumentsFilter />
        </PageSubHeader>
      )}
      <ScrollArea className="flex-1" viewportClassName="[&>div]:block">
        <Component documents={documents} />

        {!loading && documents?.length === 0 && (
          <div className="h-full w-full px-8 flex justify-center">
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="mb-6">
                <IconGitBranch
                  size={64}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">No document yet</h3>
                <p className="text-muted-foreground max-w-md">
                  Get started by creating your first documents.
                </p>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
