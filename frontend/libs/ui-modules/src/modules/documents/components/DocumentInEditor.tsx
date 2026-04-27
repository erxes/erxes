import { filterSuggestionItems } from '@blocknote/core';
import {
  DefaultReactSuggestionItem,
  SuggestionMenuController,
} from '@blocknote/react';
import {
  IBlockEditor,
  SlashMenuProps,
  SuggestionMenu,
  SuggestionMenuItem,
} from 'erxes-ui';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useDebounce } from 'use-debounce';
import { useDocuments } from '../hooks/useDocuments';

interface DocumentInEditorProps {
  editor: IBlockEditor;
  documents?: any;
  loading?: boolean;
  handleFetchMore?: () => void;
}

interface DocumentMenuWrapperProps extends DocumentInEditorProps {
  contentType?: string;
}

interface DocumentMenuProps extends SlashMenuProps {
  items: DefaultReactSuggestionItem[];
  documents?: any[];
  loading?: boolean;
  handleFetchMore?: () => void;
}

interface DocumentMenuItemProps {
  onClick: () => void;
  isSelected: boolean;
  index: number;
  text: string;
  document?: any;
}

function getDocumentMenuItems(
  editor: IBlockEditor,
  documents: any[],
): DefaultReactSuggestionItem[] {
  return documents.map((document) => ({
    title: document.label || document.name || '',
    onItemClick: async () => {
      editor.suggestionMenus.clearQuery();
      editor.suggestionMenus.closeMenu();

      let blocks;

      try {
        blocks = JSON.parse(document.content);
      } catch (_error) {
        blocks = await editor.tryParseHTMLToBlocks(document.content);
      }

      editor.replaceBlocks(editor.document, blocks);
    },
  }));
}

function DocumentMenuItem({
  onClick,
  isSelected,
  document,
}: DocumentMenuItemProps) {
  return (
    <SuggestionMenuItem
      isSelected={isSelected}
      onClick={onClick}
      className="justify-start cursor-pointer hover:bg-muted"
    >
      {!!document && <div>{document.label || document.name}</div>}
    </SuggestionMenuItem>
  );
}

function DocumentMenu({
  items,
  selectedIndex,
  documents,
  loading,
  handleFetchMore,
}: DocumentMenuProps) {
  const { ref: bottomRef } = useInView({
    onChange: (inView) => {
      if (inView && !loading) {
        handleFetchMore?.();
      }
    },
  });

  if (loading) {
    return <div className="p-2">Loading...</div>;
  }

  if (items.length === 0) {
    return <div className="p-2">No document found.</div>;
  }

  return (
    <SuggestionMenu>
      {(items || []).map((item, index) => {
        return (
          <DocumentMenuItem
            key={item.title}
            onClick={item.onItemClick}
            text={item.title}
            isSelected={selectedIndex === index}
            index={index}
            document={(documents || []).find(
              (document) => (document.label || document.name) === item.title,
            )}
          />
        );
      })}
      <div ref={bottomRef} />
    </SuggestionMenu>
  );
}

const DocumentInEditor = ({
  editor,
  documents,
  loading,
  handleFetchMore,
}: DocumentInEditorProps) => {
  return (
    <SuggestionMenuController
      triggerCharacter="@"
      suggestionMenuComponent={(props) => (
        <DocumentMenu
          {...props}
          loading={loading}
          documents={documents}
          handleFetchMore={handleFetchMore}
        />
      )}
      getItems={async (query) =>
        filterSuggestionItems(
          getDocumentMenuItems(editor, documents || []),
          query,
        )
      }
    />
  );
};

const DocumentMenuWrapper = (props: DocumentMenuWrapperProps) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);

  const variables: Record<string, string> = {};

  if (debouncedSearch) {
    variables.searchValue = debouncedSearch;
  }

  if (props.contentType) {
    variables.contentType = props.contentType;
  }

  const {
    documents = [],
    loading,
    handleFetchMore,
    totalCount = 0,
  } = useDocuments({
    variables,
  });

  const updatedProps = {
    ...props,
    documents,
    handleFetchMore,
    loading,
    totalCount,
  };

  return <DocumentInEditor {...updatedProps} />;
};

export { DocumentMenuWrapper as DocumentInEditor };
