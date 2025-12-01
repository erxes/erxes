import { useAutomationEmailTemplates } from '@/automations/components/settings/components/email-templates/hooks/useAutomationEmailTemplates';
import { useAutomationEmailTemplateDetailLazy } from '@/automations/components/settings/components/email-templates/hooks/useAutomationEmailTemplateDetailLazy';
import { IAutomationEmailTemplate } from '@/automations/components/settings/components/email-templates/types/automationEmailTemplates';
import { IconTemplate, IconPlus } from '@tabler/icons-react';
import { Button, Popover, Command, Combobox } from 'erxes-ui';
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

interface SelectEmailTemplateProps {
  onSelect: (value: string) => void;
  onContentSelect?: (content: string) => void;
  placeholder?: string;
}

export const SelectEmailTemplate = ({
  onSelect,
  onContentSelect,
  placeholder = 'Select email template',
}: SelectEmailTemplateProps) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const [open, setOpen] = useState(false);

  const { emailTemplates = [], loading } = useAutomationEmailTemplates({
    searchValue: debouncedSearch,
  });

  const { loadEmailTemplate, emailTemplate } =
    useAutomationEmailTemplateDetailLazy();

  // Handle template content loading
  useEffect(() => {
    if (emailTemplate?.content && onContentSelect) {
      onContentSelect(emailTemplate.content);
    }
  }, [emailTemplate?.content, onContentSelect]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger className="w-full" asChild>
        <Button>
          <IconTemplate />
          {placeholder}
        </Button>
      </Popover.Trigger>

      <Combobox.Content className="w-full min-w-80">
        <Command shouldFilter={false}>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            variant="secondary"
            wrapperClassName="flex-auto"
            focusOnMount
            placeholder="Search email templates..."
          />
          <Command.List className="max-h-[300px] overflow-y-auto">
            <Combobox.Empty loading={loading} />
            {!loading && emailTemplates.length === 0 && (
              <div className="p-4 text-center text-muted-foreground">
                No email templates found
              </div>
            )}
            {!loading &&
              emailTemplates.map((template: IAutomationEmailTemplate) => (
                <Command.Item
                  key={template._id}
                  value={template._id}
                  onSelect={() => {
                    onSelect(template._id);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col">
                      <span className="font-medium">{template.name}</span>
                      {template.description && (
                        <span className="text-sm text-muted-foreground">
                          {template.description}
                        </span>
                      )}
                    </div>
                    {onContentSelect && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          loadEmailTemplate(template._id);
                        }}
                        title="Insert template content"
                      >
                        <IconPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Command.Item>
              ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
