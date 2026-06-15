import { IconChevronDown, IconVariable } from '@tabler/icons-react';
import { Button, Combobox, Command, IBlockEditor, Popover } from 'erxes-ui';
import { useMemo, useState } from 'react';

interface Attribute {
  label?: string;
  name: string;
  value?: any;
  groupDetail?: {
    name: string;
  };
}

export const DocumentAttributesDropdown = ({
  editor,
  attributes,
  loading,
}: {
  editor: IBlockEditor;
  attributes: Attribute[];
  loading?: boolean;
}) => {
  const [open, setOpen] = useState(false);

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

  const insertAttribute = (attribute: Attribute) => {
    editor.focus();
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
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="secondary" className="h-8 gap-1.5 font-medium">
          <IconVariable className="size-4 text-muted-foreground" />
          Attributes
          <IconChevronDown className="size-4 text-muted-foreground opacity-50" />
        </Button>
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={!loading}>
          <Command.Input variant="primary" placeholder="Search attribute" />
          <Command.List className="max-h-80">
            <Combobox.Empty loading={loading} />
            {!loading &&
              Object.entries(grouped).map(([groupName, items]) => (
                <Command.Group key={groupName} heading={groupName}>
                  {items.map((attr, index) => (
                    <Command.Item
                      key={`${groupName}-${attr.value || attr.name}-${index}`}
                      value={`${groupName} ${attr.label || attr.name} ${
                        attr.value || attr.name
                      } #${index}`}
                      onSelect={() => insertAttribute(attr)}
                      className="flex flex-col items-start gap-0.5 h-auto py-1.5 cursor-pointer"
                    >
                      <span className="text-sm text-foreground">
                        {attr.label || attr.name}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {`{{ ${attr.value || attr.name} }}`}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
