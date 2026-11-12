import type { TableHandleMenuProps } from '@blocknote/react';
import { useBlockNoteEditor, useComponentsContext, useDictionary } from '@blocknote/react';
import { mapTableCell } from '@blocknote/core';
import type { CSSProperties } from 'react';
import { useMemo } from 'react';

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

type ColorProp = 'textColor' | 'backgroundColor';

const ColorIcon = ({ prop, color }: { prop: ColorProp; color: string }) => (
  <span
    className="bn-color-icon"
    data-background-color={prop === 'backgroundColor' ? color : 'default'}
    data-text-color={prop === 'textColor' ? color : 'default'}
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

// One color list (text or background); a color is checked when every selected cell has it.
const ColorMenuItems = ({
  prop,
  title,
  currentColors,
  onPick,
}: {
  prop: ColorProp;
  title: string;
  currentColors: string[];
  onPick: (prop: ColorProp, color: string) => void;
}) => {
  const Components = useComponentsContext();
  const dictionary = useDictionary();

  if (!Components) return null;

  return (
    <>
      <Components.Generic.Menu.Label>{title}</Components.Generic.Menu.Label>
      {COLORS.map((color) => (
        <Components.Generic.Menu.Item
          key={color}
          icon={<ColorIcon prop={prop} color={color} />}
          checked={currentColors.every((current) => current === color)}
          onClick={() => onPick(prop, color)}
        >
          {dictionary.color_picker.colors[color]}
        </Components.Generic.Menu.Item>
      ))}
    </>
  );
};

/** Text and background colors for the cells of one table row or column. */
export const TableColorPicker = ({ block, orientation, index }: TableHandleMenuProps) => {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext();
  const dictionary = useDictionary();
  const tableHandles = editor.tableHandles;

  const currentCells = useMemo(() => {
    if (!tableHandles) return [];

    return orientation === 'row'
      ? tableHandles.getCellsAtRowHandle(block, index)
      : tableHandles.getCellsAtColumnHandle(block, index);
  }, [block, index, orientation, tableHandles]);

  if (!Components || !tableHandles || currentCells.length === 0) return null;

  const cellProps = currentCells.map(({ cell }) => mapTableCell(cell).props);
  const selected = new Set(currentCells.map(({ row, col }) => `${row}:${col}`));

  const updateColor = (prop: ColorProp, color: string) => {
    const rows = block.content.rows.map((row, rowIndex) => ({
      ...row,
      cells: row.cells.map((cell, colIndex) => {
        const tableCell = mapTableCell(cell);

        return selected.has(`${rowIndex}:${colIndex}`)
          ? { ...tableCell, props: { ...tableCell.props, [prop]: color } }
          : tableCell;
      }),
    }));

    editor.updateBlock(block, { content: { ...block.content, rows } });
    editor.setTextCursorPosition(block);
  };

  return (
    <Components.Generic.Menu.Root position="right" sub>
      <Components.Generic.Menu.Trigger sub>
        <Components.Generic.Menu.Item className="bn-menu-item" subTrigger>
          {dictionary.drag_handle.colors_menuitem}
        </Components.Generic.Menu.Item>
      </Components.Generic.Menu.Trigger>
      <Components.Generic.Menu.Dropdown sub className="bn-menu-dropdown bn-color-picker-dropdown">
        <ColorMenuItems
          prop="textColor"
          title={dictionary.color_picker.text_title}
          currentColors={cellProps.map((props) => props.textColor)}
          onPick={updateColor}
        />
        <ColorMenuItems
          prop="backgroundColor"
          title={dictionary.color_picker.background_title}
          currentColors={cellProps.map((props) => props.backgroundColor)}
          onPick={updateColor}
        />
      </Components.Generic.Menu.Dropdown>
    </Components.Generic.Menu.Root>
  );
};
