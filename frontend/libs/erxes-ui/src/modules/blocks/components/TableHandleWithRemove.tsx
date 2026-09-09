import {
  AddButton,
  DeleteButton,
  TableHandle,
  TableHandleMenu,
  TableHandleMenuProps,
  TableHandleProps,
  useBlockNoteEditor,
  useComponentsContext,
  useDictionary,
} from '@blocknote/react';
import { isTableCell, mapTableCell } from '@blocknote/core';
import { IconGripVertical } from '@tabler/icons-react';
import { CSSProperties, useMemo } from 'react';

const COLORS = [
  'default',
  'gray',
  'brown',
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
] as const;

const ColorIcon = ({
  backgroundColor = 'default',
  textColor = 'default',
}: {
  backgroundColor?: string;
  textColor?: string;
}) => (
  <span
    className="bn-color-icon"
    data-background-color={backgroundColor}
    data-text-color={textColor}
    style={
      {
        pointerEvents: 'none',
        fontSize: '13.5px',
        height: '18px',
        lineHeight: '18px',
        textAlign: 'center',
        width: '18px',
      } satisfies CSSProperties
    }
  >
    A
  </span>
);

const TableColorPicker = (props: TableHandleMenuProps) => {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext();
  const dictionary = useDictionary();
  const tableHandles = editor.tableHandles;
  const currentCells = useMemo(() => {
    if (!tableHandles) {
      return [];
    }

    return props.orientation === 'row'
      ? tableHandles.getCellsAtRowHandle(props.block, props.index)
      : tableHandles.getCellsAtColumnHandle(props.block, props.index);
  }, [props.block, props.index, props.orientation, tableHandles]);

  if (!Components || !tableHandles || !currentCells[0]) {
    return null;
  }

  const firstCell = mapTableCell(currentCells[0].cell);
  const updateColor = (color: string, type: 'text' | 'background') => {
    const rows = props.block.content.rows.map((row) => ({
      ...row,
      cells: row.cells.map((cell) => mapTableCell(cell)),
    }));

    currentCells.forEach(({ row, col }) => {
      if (type === 'text') {
        rows[row].cells[col].props.textColor = color;
      } else {
        rows[row].cells[col].props.backgroundColor = color;
      }
    });

    editor.updateBlock(props.block, {
      content: { ...props.block.content, rows },
    });
    editor.setTextCursorPosition(props.block);
  };

  return (
    <Components.Generic.Menu.Root position="right" sub>
      <Components.Generic.Menu.Trigger sub>
        <Components.Generic.Menu.Item className="bn-menu-item" subTrigger>
          {dictionary.drag_handle.colors_menuitem}
        </Components.Generic.Menu.Item>
      </Components.Generic.Menu.Trigger>
      <Components.Generic.Menu.Dropdown
        sub
        className="bn-menu-dropdown bn-color-picker-dropdown"
      >
        <Components.Generic.Menu.Label>
          {dictionary.color_picker.text_title}
        </Components.Generic.Menu.Label>
        {COLORS.map((color) => (
          <Components.Generic.Menu.Item
            key={`text-color-${color}`}
            icon={<ColorIcon textColor={color} />}
            checked={
              currentCells.every(
                ({ cell }) =>
                  isTableCell(cell) &&
                  cell.props.textColor === firstCell.props.textColor,
              ) && firstCell.props.textColor === color
            }
            onClick={() => updateColor(color, 'text')}
          >
            {dictionary.color_picker.colors[color]}
          </Components.Generic.Menu.Item>
        ))}
        <Components.Generic.Menu.Label>
          {dictionary.color_picker.background_title}
        </Components.Generic.Menu.Label>
        {COLORS.map((color) => (
          <Components.Generic.Menu.Item
            key={`background-color-${color}`}
            icon={<ColorIcon backgroundColor={color} />}
            checked={
              currentCells.every(
                ({ cell }) =>
                  isTableCell(cell) &&
                  cell.props.backgroundColor ===
                    firstCell.props.backgroundColor,
              ) && firstCell.props.backgroundColor === color
            }
            onClick={() => updateColor(color, 'background')}
          >
            {dictionary.color_picker.colors[color]}
          </Components.Generic.Menu.Item>
        ))}
      </Components.Generic.Menu.Dropdown>
    </Components.Generic.Menu.Root>
  );
};

const TableHandleMenuWithRemove = (props: TableHandleMenuProps) => {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext();

  if (!Components) {
    return null;
  }

  const isHeader =
    props.orientation === 'row'
      ? Boolean(props.block.content.headerRows)
      : Boolean(props.block.content.headerCols);

  const toggleHeader = () => {
    const block = editor.getBlock(props.block.id);

    if (!block || block.type !== 'table') {
      return;
    }

    editor.updateBlock(block, {
      content: {
        ...block.content,
        ...(props.orientation === 'row'
          ? { headerRows: isHeader ? undefined : 1 }
          : { headerCols: isHeader ? undefined : 1 }),
      },
    });
  };

  return (
    <TableHandleMenu {...props}>
      <DeleteButton {...props} />
      {props.orientation === 'row' ? (
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
      {props.index === 0 && (
        <Components.Generic.Menu.Item
          className="bn-menu-item"
          checked={isHeader}
          onClick={toggleHeader}
        >
          {props.orientation === 'row' ? 'Header row' : 'Header column'}
        </Components.Generic.Menu.Item>
      )}
      <TableColorPicker {...props} />
      <Components.Generic.Menu.Divider />
      <Components.Generic.Menu.Item
        className="bn-menu-item"
        onClick={() => editor.removeBlocks([props.block])}
      >
        Delete table
      </Components.Generic.Menu.Item>
    </TableHandleMenu>
  );
};

export const TableHandleWithRemove = (props: TableHandleProps) => {
  return (
    <TableHandle {...props} tableHandleMenu={TableHandleMenuWithRemove}>
      <IconGripVertical size={24} data-test="tableHandle" />
    </TableHandle>
  );
};
