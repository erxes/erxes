import { IconCube, IconLayoutGrid } from '@tabler/icons-react';
import { Sidebar, useMultiQueryState } from 'erxes-ui';
import { DOCUMENTS_TYPES_SET } from '../constants';
import { useDocumentsTypes } from '../hooks/useDocumentsTypes';
import { IDocumentType } from '../types';

type DocumentsTypeQuery = {
  contentType: string;
  documentId: string;
};

function AllDocumentsMenu({
  isActive,
  onSelect,
}: {
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton onClick={onSelect} isActive={isActive}>
          <IconLayoutGrid />
          All Documents
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  );
}

function DocumentsTypeMenu({
  contentType,
  documentsTypes,
  onSelect,
}: {
  contentType: string | null;
  documentsTypes: IDocumentType[];
  onSelect: (contentType: string) => void;
}) {
  return (
    <Sidebar.Menu>
      {documentsTypes.map(({ contentType: module, label }) => {
        const Icon = DOCUMENTS_TYPES_SET?.[module]?.['icon'] || IconCube;

        return (
          <Sidebar.MenuItem key={module} className="relative">
            <Sidebar.MenuButton
              isActive={module === contentType}
              onClick={() => onSelect(module)}
            >
              <Icon />
              {label}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        );
      })}
    </Sidebar.Menu>
  );
}

export function DocumentsTypes() {
  const [{ contentType }, setQueries] = useMultiQueryState<DocumentsTypeQuery>([
    'contentType',
    'documentId',
  ]);

  const { documentsTypes } = useDocumentsTypes();

  function handleAllDocumentsSelect() {
    setQueries({ contentType: null, documentId: null });
  }

  function handleDocumentTypeSelect(nextContentType: string) {
    setQueries({ contentType: nextContentType, documentId: null });
  }

  return (
    <Sidebar collapsible="none" className="w-full border-r bg-muted/20">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <AllDocumentsMenu
            isActive={!contentType}
            onSelect={handleAllDocumentsSelect}
          />
        </Sidebar.GroupContent>
        <Sidebar.GroupLabel className="h-12 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Document types
        </Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <DocumentsTypeMenu
            contentType={contentType}
            documentsTypes={documentsTypes}
            onSelect={handleDocumentTypeSelect}
          />
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
}
