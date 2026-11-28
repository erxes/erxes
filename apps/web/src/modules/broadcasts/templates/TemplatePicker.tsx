import { IconDeviceFloppy, IconTemplate } from '@tabler/icons-react';
import { Button, Combobox, Command, EntityPicker, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { EmailNode } from '../emailDocument';
import { useTemplatePicker } from './useTemplatePicker';

/** "Templates" by the message's label: pick one to start from, or keep this message as one. */
export const TemplatePicker = ({
  content,
  onUse,
}: {
  content: EmailNode | null;
  onUse: (content: EmailNode) => void;
}) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'templates' });
  const picker = useTemplatePicker(content, onUse);
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger render={<Button variant="ghost" size="sm" />}>
        <IconTemplate />
        {t('menu', 'Templates')}
      </Popover.Trigger>
      <Combobox.Content align="end">
        <EntityPicker
          items={picker.items}
          itemKey={(template) => ({ id: template.id, label: template.name })}
          value={[]}
          onValueChange={([id]) => {
            setOpen(false);

            if (id) picker.use(id);
          }}
          loading={picker.loading}
          error={picker.error}
          onSearchChange={picker.setSearch}
          searchPlaceholder={t('search', 'Find a template, or name a new one')}
          renderCreate={(name, clear) =>
            name &&
            picker.canSave && (
              <Command.Item
                value="__save__"
                disabled={picker.saving}
                onSelect={() => {
                  picker.saveAs(name);
                  clear();
                  setOpen(false);
                }}
              >
                <IconDeviceFloppy />
                {t('save-as', 'Save this message as “{{name}}”', { name })}
              </Command.Item>
            )
          }
        />
      </Combobox.Content>
    </Popover>
  );
};
