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
      all: t('all-sources'),
      'facebook-messenger': t('facebook-messenger'),
      'facebook-post': t('facebook-post'),
      'instagram-messenger': t('instagram-messenger'),
      'instagram-post': t('instagram-post'),
      calls: t('calls'),
      messenger: t('messenger'),
      form: t('source-form'),
    };
    return labels[value] || value;
  };

  return (
    <div className="flex items-center gap-2 shrink-0 flex-none">
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        Group By
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
                {t('all-sources')}
              </Command.Item>
              <Command.Item
                value="facebook-messenger"
                onSelect={() => handleValueChange('facebook-messenger')}
              >
                {t('facebook-messenger')}
              </Command.Item>
              <Command.Item
                value="facebook-post"
                onSelect={() => handleValueChange('facebook-post')}
              >
                {t('facebook-post')}
              </Command.Item>
              <Command.Item
                value="instagram-messenger"
                onSelect={() => handleValueChange('instagram-messenger')}
              >
                {t('instagram-messenger')}
              </Command.Item>
              <Command.Item
                value="instagram-post"
                onSelect={() => handleValueChange('instagram-post')}
              >
                {t('instagram-post')}
              </Command.Item>
              <Command.Item
                value="calls"
                onSelect={() => handleValueChange('calls')}
              >
                {t('calls')}
              </Command.Item>
              <Command.Item
                value="messenger"
                onSelect={() => handleValueChange('messenger')}
              >
                {t('messenger')}
              </Command.Item>
              <Command.Item
                value="form"
                onSelect={() => handleValueChange('form')}
              >
                {t('source-form')}
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </PopoverScoped>
    </div>
  );
};
