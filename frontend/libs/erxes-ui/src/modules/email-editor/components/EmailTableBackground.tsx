import { IconCheck, IconPaint } from '@tabler/icons-react';
import type { Editor } from '@tiptap/core';
import { Button, Popover, ToggleGroup, Tooltip } from 'erxes-ui/components';
import { useState } from 'react';
import type { TEmailTableBackgroundScope } from '../extensions/table';

/**
 * Backgrounds an email can wear: pale enough to keep text readable in a client
 * that ignores the colour the text was given.
 */
const BACKGROUNDS = [
  '#f9fafb',
  '#f3f4f6',
  '#e5e7eb',
  '#fef2f2',
  '#fff7ed',
  '#fefce8',
  '#f0fdf4',
  '#eff6ff',
  '#eef2ff',
  '#faf5ff',
];

const SCOPES: { value: TEmailTableBackgroundScope; label: string }[] = [
  { value: 'cell', label: 'Cell' },
  { value: 'row', label: 'Row' },
  { value: 'column', label: 'Column' },
  { value: 'table', label: 'Table' },
];

/** What the caret's cell is currently painted with, header or body. */
const currentBackground = (editor: Editor): string | undefined =>
  editor.getAttributes('tableHeader').backgroundColor ||
  editor.getAttributes('tableCell').backgroundColor;

export const EmailTableBackground = ({ editor }: { editor: Editor }) => {
  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<TEmailTableBackgroundScope>('cell');

  const value = currentBackground(editor);

  const apply = (color: string | null) => {
    editor.view.focus();
    editor.commands.setTableBackground({ color, scope });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Popover.Trigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label="Background color"
              // Keeps the cell selection, which every table command reads.
              onMouseDown={(event) => event.preventDefault()}
            >
              <IconPaint className="size-4" style={{ color: value }} />
            </Button>
          </Popover.Trigger>
        </Tooltip.Trigger>
        <Tooltip.Content side="bottom">Background color</Tooltip.Content>
      </Tooltip>

      <Popover.Content
        className="w-60 space-y-2 p-2"
        align="center"
        side="top"
        onMouseDown={(event) => event.preventDefault()}
      >
        <ToggleGroup
          type="single"
          value={scope}
          onValueChange={(next) =>
            next && setScope(next as TEmailTableBackgroundScope)
          }
          className="grid grid-cols-4 gap-1"
        >
          {SCOPES.map(({ value: option, label }) => (
            <ToggleGroup.Item key={option} value={option} asChild>
              <Button variant="secondary" size="sm" className="h-7 border">
                <span className="text-xs font-normal">{label}</span>
              </Button>
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>

        <div className="grid grid-cols-5 gap-1">
          {BACKGROUNDS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              className="flex aspect-3/2 items-center justify-center rounded border transition-transform hover:scale-105"
              style={{ backgroundColor: color }}
              onClick={() => apply(color)}
            >
              {value === color && <IconCheck className="size-4" />}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="color"
            aria-label="Custom background color"
            className="h-7 w-full cursor-pointer rounded border bg-background"
            value={value || '#ffffff'}
            onChange={(event) =>
              editor.commands.setTableBackground({
                color: event.target.value,
                scope,
              })
            }
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => apply(null)}
        >
          No color
        </Button>
      </Popover.Content>
    </Popover>
  );
};
