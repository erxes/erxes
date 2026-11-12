import type { DefaultBlockSchema } from '@blocknote/core';
import type { DragHandleMenuProps, TableHandleMenuProps, TableHandleProps } from '@blocknote/react';
import {
  AddButton,
  DeleteButton,
  TableHandle,
  TableHandleMenu,
  useBlockNoteEditor,
  useComponentsContext,
} from '@blocknote/react';
import { IconGripVertical } from '@tabler/icons-react';
import { createContext, useContext } from 'react';
import { TableColorPicker } from './TableColorPicker';

type HandlePosition = Pick<TableHandleMenuProps, 'orientation' | 'index'>;

// TableHandle renders its menu with { block, orientation, index }, but types the menu as
// taking only { block }; the handle's position reaches the menu through this context instead.
const TableHandlePositionContext = createContext<HandlePosition>({ orientation: 'row', index: 0 });

const DeleteTableItem = ({ blockId }: { blockId: string }) => {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext();

  if (!Components) return null;

  const deleteTable = () => {
    requestAnimationFrame(() => {
      const block = editor.getBlock(blockId);

      if (block?.type !== 'table') return;

      const {
        insertedBlocks: [paragraph],
      } = editor.replaceBlocks([block], [{ type: 'paragraph' }]);

      if (paragraph) editor.setTextCursorPosition(paragraph, 'start');
      editor.focus();
    });
  };

  return (
    <Components.Generic.Menu.Item className="bn-menu-item" onClick={deleteTable}>
      Delete table
    </Components.Generic.Menu.Item>
  );
};

const TableHandleMenuWithRemove = ({
  block,
}: DragHandleMenuProps<{ table: DefaultBlockSchema['table'] }>) => {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext();
  const { orientation, index } = useContext(TableHandlePositionContext);
  const props = { block, orientation, index };

  if (!Components) return null;

  const isHeader = Boolean(
    orientation === 'row' ? block.content.headerRows : block.content.headerCols,
  );

  const toggleHeader = () => {
    const current = editor.getBlock(block.id);

    if (current?.type !== 'table') return;

    const header = isHeader ? undefined : 1;

    editor.updateBlock(current, {
      content: {
        ...current.content,
        ...(orientation === 'row' ? { headerRows: header } : { headerCols: header }),
      },
    });
  };

  return (
    <TableHandleMenu {...props}>
      <DeleteButton {...props} />
      {orientation === 'row' ? (
        <>
          <AddButton {...props} orientation="row" side="above" />
          <AddButton {...props} orientation="row" side="below" />
        </>
      ) : (
        <>
          <AddButton {...props} orientation="column" side="left" />
          <AddButton {...props} orientation="column" side="right" />
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
      <TableColorPicker {...props} />
      <Components.Generic.Menu.Divider />
      <DeleteTableItem blockId={block.id} />
    </TableHandleMenu>
  );
};

export const TableHandleWithRemove = (props: TableHandleProps) => (
  <TableHandlePositionContext.Provider
    value={{ orientation: props.orientation, index: props.index }}
  >
    <TableHandle {...props} tableHandleMenu={TableHandleMenuWithRemove}>
      <IconGripVertical size={24} data-test="tableHandle" />
    </TableHandle>
  </TableHandlePositionContext.Provider>
);
