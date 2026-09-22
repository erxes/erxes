import { PopoverScoped, Combobox, Command } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface GroupSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const GroupSelect = ({
  value = 'all',
  onValueChange,
}: GroupSelectProps) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);
    setOpen(false);
  };

  const getDisplayLabel = () => {
    const labels: Record<string, string> = {
      all: t('all-sources', 'All Sources'),
      'facebook-messenger': t('facebook-messenger', 'Facebook Messenger'),
      'facebook-post': t('facebook-post', 'Facebook Post'),
      'instagram-messenger': t('instagram-messenger', 'Instagram Messenger'),
      'instagram-post': t('instagram-post', 'Instagram Post'),
      calls: t('calls', 'Calls'),
      messenger: t('messenger', 'Messenger'),
      form: t('source-form', 'Form'),
    };
    return labels[value] || value;
  };

  return (
    <div className="flex items-center gap-2 shrink-0 flex-none">
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {t('group-by-label', 'Group By')}
      </span>
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Combobox.TriggerBase>
          <span className="text-xs">{getDisplayLabel()}</span>
        </Combobox.TriggerBase>
        <Combobox.Content>
          <Command>
            <Command.List>
              <Command.Item
                value="all"
                onSelect={() => handleValueChange('all')}
              >
                {t('all-sources', 'All Sources')}
              </Command.Item>
              <Command.Item
                value="facebook-messenger"
                onSelect={() => handleValueChange('facebook-messenger')}
              >
                {t('facebook-messenger', 'Facebook Messenger')}
              </Command.Item>
              <Command.Item
                value="facebook-post"
                onSelect={() => handleValueChange('facebook-post')}
              >
                {t('facebook-post', 'Facebook Post')}
              </Command.Item>
              <Command.Item
                value="instagram-messenger"
                onSelect={() => handleValueChange('instagram-messenger')}
              >
                {t('instagram-messenger', 'Instagram Messenger')}
              </Command.Item>
              <Command.Item
                value="instagram-post"
                onSelect={() => handleValueChange('instagram-post')}
              >
                {t('instagram-post', 'Instagram Post')}
              </Command.Item>
              <Command.Item
                value="calls"
                onSelect={() => handleValueChange('calls')}
              >
                {t('calls', 'Calls')}
              </Command.Item>
              <Command.Item
                value="messenger"
                onSelect={() => handleValueChange('messenger')}
              >
                {t('messenger', 'Messenger')}
              </Command.Item>
              <Command.Item
                value="form"
                onSelect={() => handleValueChange('form')}
              >
                {t('source-form', 'Form')}
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </PopoverScoped>
    </div>
  );
};
