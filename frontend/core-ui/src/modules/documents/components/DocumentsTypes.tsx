import { Sidebar, useQueryState } from 'erxes-ui';
import { DOCUMENTS_TYPES_SET } from '../constants';
import { useDocumentsTypes } from '../hooks/useDocumentsTypes';
import { IDocumentType } from '../types';

export const DocumentsTypes = () => {
  const [contentType, setQuery] = useQueryState('contentType');

  const { documentsTypes } = useDocumentsTypes();

  return (
    <Sidebar collapsible="none" className="w-full">
      <Sidebar.Group>
        <Sidebar.GroupLabel className="py-5">Document types</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {documentsTypes.map(
              ({ contentType: module, label }: IDocumentType) => {
                const Icon = DOCUMENTS_TYPES_SET[module]['icon'];

                return (
                  <Sidebar.MenuItem key={module}>
                    <Sidebar.MenuButton
                      isActive={module === contentType}
                      onClick={() => {
                        setQuery(module);
                      }}
                    >
                      <Icon />
                      {label}
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                );
              },
            )}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
