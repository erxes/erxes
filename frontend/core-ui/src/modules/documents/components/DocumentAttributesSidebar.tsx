import {
  ATTRIBUTE_DND_MIME,
  insertAttribute,
} from '@/documents/utils/attributeDnd';
import { IconGripVertical, IconX } from '@tabler/icons-react';
import { Button, Command, IBlockEditor, ScrollArea } from 'erxes-ui';
import { useMemo, useState } from 'react';

interface Attribute {
  label?: string;
  name: string;
  value?: any;
  groupDetail?: {
    name: string;
  };
}

export const DocumentAttributesSidebar = ({
  editor,
  attributes,
  loading,
  onClose,
}: {
  editor: IBlockEditor;
  attributes: Attribute[];
  loading?: boolean;
  onClose: () => void;
}) => {
  const [search, setSearch] = useState('');

  const grouped = useMemo(() => {
    const result: Record<string, Attribute[]> = {};

    for (const attr of attributes) {
      const group = attr.groupDetail?.name || 'General';

      if (!result[group]) {
        result[group] = [];
      }

      result[group].push(attr);
    }

    return result;
  }, [attributes]);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    attribute: Attribute,
  ) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData(
      ATTRIBUTE_DND_MIME,
      JSON.stringify({
        label: attribute.label,
        name: attribute.name,
        value: attribute.value,
      }),
    );
  };

  return (
    <aside className="flex h-full w-80 flex-none flex-col border-l bg-muted/20">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Attributes</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          onClick={onClose}
          aria-label="Close attributes"
        >
          <IconX />
        </Button>
      </div>
      <Command shouldFilter={!loading} className="min-h-0 flex-1">
        <div className="px-3">
          <Command.Input
            variant="primary"
            placeholder="Search attributes"
            value={search}
            onValueChange={setSearch}
          />
        </div>
        <ScrollArea className="flex-1">
          <Command.List className="max-h-none px-2 py-2">
            {loading && (
              <div className="space-y-2 px-2 py-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 animate-pulse rounded-md bg-muted"
                  />
                ))}
              </div>
            )}
            {!loading && (
              <Command.Empty>No attributes match your search.</Command.Empty>
            )}
            {!loading &&
              Object.entries(grouped).map(([groupName, items]) => (
                <Command.Group key={groupName} heading={groupName}>
                  {items.map((attr, index) => (
                    <Command.Item
                      key={`${groupName}-${attr.value || attr.name}-${index}`}
                      value={`${groupName} ${attr.label || attr.name} ${
                        attr.value || attr.name
                      } #${index}`}
                      onSelect={() => insertAttribute(editor, attr)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, attr)}
                      className="group flex h-auto cursor-grab items-center gap-2 rounded-md py-1.5 active:cursor-grabbing data-[selected=true]:bg-accent"
                    >
                      <IconGripVertical className="size-4 shrink-0 text-muted-foreground/30 group-data-[selected=true]:text-muted-foreground" />
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="truncate text-sm text-foreground">
                          {attr.label || attr.name}
                        </span>
                        <span className="truncate text-sm text-foreground">
                          {"{{ "}{attr.value}{" }}"}
                        </span>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
          </Command.List>
        </ScrollArea>
      </Command>
    </aside>
  );
};
