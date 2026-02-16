import { Button, Command, Popover } from 'erxes-ui';
import {
  IconCheck,
  IconChevronDown,
  IconTemplateFilled,
} from '@tabler/icons-react';
import React, { useState } from 'react';

import { IOperationTemplate } from '../types';
import { useTemplates } from '../hooks/useTemplates';

interface SelectTemplateProps {
  teamId?: string;
  onSelect: (template: IOperationTemplate) => void;
}

export const SelectTemplate = ({ teamId, onSelect }: SelectTemplateProps) => {
  const { templates, loading } = useTemplates({ teamId });
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<IOperationTemplate | null>(null);

  if (loading) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="outline" className="w-[120px] h-8 p-2 justify-between">
          <span className="flex items-center">
            <IconTemplateFilled className="size-4 mr-2 shrink-0" />
            <span className="truncate">
              {selected ? selected.name : 'Template'}
            </span>
          </span>
          <IconChevronDown className="size-4 opacity-50 shrink-0" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-[200px] p-0" align="start">
        <Command>
          <Command.Input placeholder="Search template..." />
          <Command.List>
            <Command.Empty>No templates found.</Command.Empty>
            <Command.Group>
              {templates.map((template) => (
                <Command.Item
                  key={template._id}
                  value={template.name}
                  onSelect={() => {
                    setSelected(template);
                    onSelect(template);
                    setOpen(false);
                  }}
                >
                  <IconCheck
                    className={`mr-2 size-4 ${
                      selected?._id === template._id
                        ? 'opacity-100'
                        : 'opacity-0'
                    }`}
                  />
                  {template.name}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
