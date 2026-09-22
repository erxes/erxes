import {
  IconCurrencyDollar,
  IconFileDescription,
  IconPhoto,
  IconStack2,
} from '@tabler/icons-react';
import type { Editor } from '@tiptap/core';
import { Button, Tooltip } from 'erxes-ui/components';
import { useEffect, useState } from 'react';

const FIELDS = [
  { label: 'Image', icon: IconPhoto, attr: 'showImage' },
  { label: 'Description', icon: IconFileDescription, attr: 'showDescription' },
  { label: 'Quantity', icon: IconStack2, attr: 'showQuantity' },
  { label: 'Amount', icon: IconCurrencyDollar, attr: 'showPrice' },
] as const;

/** Which fields of the repeated item the card shows. */
export const EmailProductCardToolbar = ({
  editor,
}: {
  editor: Editor | null;
}) => {
  const [attrs, setAttrs] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const sync = () =>
      setAttrs(
        editor.isActive('productCard')
          ? (editor.getAttributes('productCard') as Record<string, boolean>)
          : null,
      );

    sync();
    editor.on('transaction', sync);

    return () => {
      editor.off('transaction', sync);
    };
  }, [editor]);

  if (!editor || !attrs) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 rounded-md border bg-background p-1 shadow-sm">
      {FIELDS.map(({ label, icon: Icon, attr }) => (
        <Tooltip key={attr}>
          <Tooltip.Trigger asChild>
            <Button
              type="button"
              variant={attrs[attr] ? 'secondary' : 'ghost'}
              size="icon"
              className="size-7"
              aria-label={label}
              aria-pressed={!!attrs[attr]}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor.commands.toggleProductCardField(attr)}
            >
              <Icon className="size-4" />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content side="bottom">
            {attrs[attr] ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          </Tooltip.Content>
        </Tooltip>
      ))}
    </div>
  );
};
