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
import {
  DocumentEditorAttribute as Attribute,
  useDocumentEditorAttributes,
} from '../hooks/useDocumentEditorAttributes';
import { createContext, useContext } from 'react';

interface AttributeInEditorProps {
  editor: IBlockEditor;
  attributes?: Attribute[];
  loading?: boolean;
}

const AttributeMenuContext = createContext<
  Pick<AttributeInEditorProps, 'attributes' | 'loading'>
>({});

const AttributeInEditor = ({
  editor,
  attributes,
  loading,
}: AttributeInEditorProps) => {
  return (
    <AttributeMenuContext.Provider value={{ attributes, loading }}>
      <SuggestionMenuController
        triggerCharacter="{"
        suggestionMenuComponent={AttributeMenu}
        getItems={(query) =>
          Promise.resolve(
            filterSuggestionItems(
              getAttributeMenuItems(editor, attributes || []),
              query,
            ),
          )
        }
      />
    </AttributeMenuContext.Provider>
  );
};

interface AttributeMenuProps extends SlashMenuProps {
  items: DefaultReactSuggestionItem[];
}

function AttributeMenu({ items, selectedIndex }: AttributeMenuProps) {
  const { attributes, loading } = useContext(AttributeMenuContext);
  if (loading) {
    return <div className="p-2">Loading...</div>;
  }

  if (items.length === 0) {
    return <div className="p-2">No attributes found.</div>;
  }

  const grouped: Record<string, typeof items> = {};

  for (const item of items) {
    const group =
      attributes?.find((attr) => (attr.label || attr.name) === item.title)
        ?.groupDetail?.name || 'General';

    if (!grouped[group]) {
      grouped[group] = [];
    }

    grouped[group].push(item);
  }

  const renderMenuItems = () => {
    let itemIndex = 0;

    return Object.entries(grouped).map(([groupName, groupItems]) => (
      <div key={groupName}>
        <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
          {groupName}
        </div>
        <div className="flex flex-col">
          {groupItems.map((item) => {
            const currentIndex = itemIndex++;

            return (
              <AttributeMenuItem
                key={item.title}
                onClick={item.onItemClick}
                text={item.title}
                isSelected={selectedIndex === currentIndex}
                index={currentIndex}
                attribute={(attributes || []).find(
                  (attr) => (attr.label || attr.name) === item.title,
                )}
              />
            );
          })}
        </div>
      </div>
    ));
  };

  return <SuggestionMenu>{renderMenuItems()}</SuggestionMenu>;
}

interface AttributeMenuWrapperProps extends AttributeInEditorProps {
  contentType?: string;
}

const AttributeMenuWrapper = (props: AttributeMenuWrapperProps) => {
  const attributes = useDocumentEditorAttributes(props);
  const updatedProps = { ...props, ...attributes };

  return <AttributeInEditor {...updatedProps} />;
};

interface AttributeMenuItemProps {
  onClick: () => void;
  isSelected: boolean;
  index: number;
  text: string;
  attribute?: Attribute;
}

function AttributeMenuItem({
  onClick,
  isSelected,
  attribute,
}: AttributeMenuItemProps) {
  return (
    <SuggestionMenuItem
      isSelected={isSelected}
      onClick={onClick}
      className="justify-start cursor-pointer hover:bg-muted"
    >
      {!!attribute && <div>{attribute.label || attribute.name}</div>}
    </SuggestionMenuItem>
  );
}

function getAttributeMenuItems(
  editor: IBlockEditor,
  attributes: Attribute[],
): DefaultReactSuggestionItem[] {
  return attributes.map((attribute) => ({
    title: attribute.label || attribute.name || '',
    onItemClick: () => {
      editor.suggestionMenus.clearQuery();
      editor.suggestionMenus.closeMenu();

      editor.insertInlineContent([
        {
          type: 'attribute',
          props: {
            name: attribute.label || attribute.name,
            value: attribute.value || attribute.name,
            width: 150,
            height: 50,
          },
        },
        ' ',
      ]);
    },
  }));
}

export { AttributeMenuWrapper as AttributeInEditor };
