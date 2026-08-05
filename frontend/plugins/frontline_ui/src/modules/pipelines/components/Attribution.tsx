import { Button, Combobox, Command, Popover, toast } from 'erxes-ui';

import { IconBraces } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  config: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
};

export const Attribution = ({ config, value, onChange }: Props) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  const handleSelect = (val: string) => {
    if (val.startsWith(' ')) {
      toast({
        title: t('error'),
        description: t('attribution-no-leading-space'),
        variant: 'destructive',
      });
      return;
    }

    const characters = ['_', '-', '/', ' '];
    const token = characters.includes(val) ? val : `{${val}}`;

    onChange(`${value}${token}`);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          aria-label={t('insert-attribute')}
          className="size-8 flex-none"
          size="icon"
          type="button"
          variant="outline"
        >
          <IconBraces />
        </Button>
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List className="p-1">
            <Combobox.Empty />
            {config.map(({ value: val, label }) => (
              <Command.Item
                key={val}
                value={val}
                className="cursor-pointer text-xs"
                onSelect={() => handleSelect(val)}
              >
                {t(label)}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
