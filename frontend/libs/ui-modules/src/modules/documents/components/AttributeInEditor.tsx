import { useQuery } from '@apollo/client';
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
  useQueryState,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { ATTRIBUTE_QUERY } from 'ui-modules/modules/documents/graphql/queries';

interface Attribute {
  label?: string;
  name: string;
  value?: any;
  groupDetail?: {
    name: string;
  };
}

interface AttributeInEditorProps {
  editor: IBlockEditor;
  attributes?: Attribute[];
  loading?: boolean;
}

const AttributeInEditor = ({
  editor,
  attributes,
  loading,
}: AttributeInEditorProps) => {
  return (
    <SuggestionMenuController
      triggerCharacter="{"
      suggestionMenuComponent={(props) => (
        <AttributeMenu {...props} loading={loading} attributes={attributes} />
      )}
      getItems={async (query) =>
        filterSuggestionItems(
          getAttributeMenuItems(editor, attributes || []),
          query,
        )
      }
    />
  );
};

interface AttributeMenuProps extends SlashMenuProps {
  items: DefaultReactSuggestionItem[];
  attributes?: Attribute[];
  loading?: boolean;
}

function AttributeMenu({
  items,
  selectedIndex,
  attributes,
  loading,
}: AttributeMenuProps) {
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
  const [contentType] = useQueryState('contentType');

  const [shouldQuery, setShouldQuery] = useState(false);

  useEffect(() => {
    if (!props.contentType && !contentType) {
      return setShouldQuery(false);
    }

    if (!props.loading && !props.attributes?.length) {
      setShouldQuery(true);
    }
  }, [props.loading, props.attributes, contentType, props.contentType]);

  const { data, loading } = useQuery(ATTRIBUTE_QUERY, {
    variables: {
      contentType: props.contentType || contentType,
    },
    skip: !shouldQuery,
  });

  const updatedProps = {
    ...props,
    attributes: props.attributes || data?.fieldsCombinedByContentType || [],
    loading: props.loading || loading,
  };

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
          },
        },
        ' ',
      ]);
    },
  }));
}

export { AttributeMenuWrapper as AttributeInEditor };
