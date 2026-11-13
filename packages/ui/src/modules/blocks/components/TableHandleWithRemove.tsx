import { TableHandlesExtension } from '@blocknote/core/extensions';
import type { TableHandleMenuProps, TableHandleProps } from '@blocknote/react';
import {
  AddButton,
  DeleteButton,
  TableHandle,
  TableHandleMenu,
  useBlockNoteEditor,
  useComponentsContext,
  useExtensionState,
} from '@blocknote/react';
import { IconGripVertical } from '@tabler/icons-react';
import { createContext, useContext } from 'react';
import { TableColorPicker } from './TableColorPicker';

// TableHandle renders its menu with the handle's orientation, but types the menu as taking
// no props, so the orientation reaches the menu through this context instead.
const TableHandleOrientationContext = createContext<TableHandleMenuProps['orientation']>('row');

const TableHandleMenuWithRemove = () => {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext();
  const orientation = useContext(TableHandleOrientationContext);

  const { block, index } = useExtensionState(TableHandlesExtension, {
    selector: (state) => ({
      block: state?.block,
      index: orientation === 'row' ? state?.rowIndex : state?.colIndex,
    }),
  });

  if (!Components || !block) return null;

  const isHeader = Boolean(
    orientation === 'row' ? block.content.headerRows : block.content.headerCols,
  );

  const toggleHeader = () => {
    const table = editor.getBlock(block.id);

    if (table?.type !== 'table') return;

    const header = isHeader ? undefined : 1;

    editor.updateBlock(table, {
      content: {
        ...table.content,
        ...(orientation === 'row' ? { headerRows: header } : { headerCols: header }),
      },
    });
  };

  const deleteTable = () => {
    requestAnimationFrame(() => {
      const table = editor.getBlock(block.id);

      if (table?.type !== 'table') return;

      const {
        insertedBlocks: [paragraph],
      } = editor.replaceBlocks([table], [{ type: 'paragraph' }]);

      if (paragraph) editor.setTextCursorPosition(paragraph, 'start');
      editor.focus();
    });
  };

  return (
    <TableHandleMenu orientation={orientation}>
      <DeleteButton orientation={orientation} />
      {orientation === 'row' ? (
        <>
          <AddButton orientation="row" side="above" />
          <AddButton orientation="row" side="below" />
        </>
      ) : (
        <>
          <AddButton orientation="column" side="left" />
          <AddButton orientation="column" side="right" />
        </>
      )}
      {index === 0 && (
        <Components.Generic.Menu.Item
          className="bn-menu-item"
          checked={isHeader}
          onClick={toggleHeader}
        >
          {orientation === 'row' ? 'Header row' : 'Header column'}
        </Components.Generic.Menu.Item>
      )}
      <TableColorPicker orientation={orientation} />
      <Components.Generic.Menu.Divider />
      <Components.Generic.Menu.Item className="bn-menu-item" onClick={deleteTable}>
        Delete table
      </Components.Generic.Menu.Item>
    </TableHandleMenu>
  );
};

export const TableHandleWithRemove = (props: TableHandleProps) => (
  <TableHandleOrientationContext.Provider value={props.orientation}>
    <TableHandle {...props} tableHandleMenu={TableHandleMenuWithRemove}>
      <IconGripVertical size={24} data-test="tableHandle" />
    </TableHandle>
  </TableHandleOrientationContext.Provider>
);
