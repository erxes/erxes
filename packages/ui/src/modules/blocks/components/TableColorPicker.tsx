import { mapTableCell } from '@blocknote/core';
import { TableHandlesExtension } from '@blocknote/core/extensions';
import type { TableHandleMenuProps } from '@blocknote/react';
import {
  useBlockNoteEditor,
  useComponentsContext,
  useDictionary,
  useExtension,
  useExtensionState,
  usePortalElement,
} from '@blocknote/react';

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
    className="bn-color-icon pointer-events-none size-4.5 text-center text-sm leading-4.5"
    data-background-color={prop === 'backgroundColor' ? color : 'default'}
    data-text-color={prop === 'textColor' ? color : 'default'}
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
export const TableColorPicker = ({ orientation }: TableHandleMenuProps) => {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext();
  const dictionary = useDictionary();
  const portalElement = usePortalElement();
  const tableHandles = useExtension(TableHandlesExtension);

  const { block, index } = useExtensionState(TableHandlesExtension, {
    selector: (state) => ({
      block: state?.block,
      index: orientation === 'row' ? state?.rowIndex : state?.colIndex,
    }),
  });

  if (!Components || !block || index === undefined) return null;

  const currentCells =
    orientation === 'row'
      ? tableHandles.getCellsAtRowHandle(block, index)
      : tableHandles.getCellsAtColumnHandle(block, index);

  if (currentCells.length === 0) return null;

  const cellProps = currentCells.map(({ cell }) => mapTableCell(cell).props);
  const selected = new Set(currentCells.map(({ row, col }) => `${row}:${col}`));

  const updateColor = (prop: ColorProp, color: string) => {
    const table = editor.getBlock(block.id);

    if (table?.type !== 'table') return;

    const rows = table.content.rows.map((row, rowIndex) => ({
      ...row,
      cells: row.cells.map((cell, colIndex) => {
        const tableCell = mapTableCell(cell);

        return selected.has(`${rowIndex}:${colIndex}`)
          ? { ...tableCell, props: { ...tableCell.props, [prop]: color } }
          : tableCell;
      }),
    }));

    editor.updateBlock(table, { content: { ...table.content, rows } });
    editor.setTextCursorPosition(table);
  };

  return (
    <Components.Generic.Menu.Root position="right" sub portalElement={portalElement}>
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
