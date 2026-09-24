import { IconTemplate } from '@tabler/icons-react';
import { Button, Input, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBroadcastSaveAsTemplate } from '../hooks/useBroadcastSaveAsTemplate';

export const BroadcastSaveAsTemplate = () => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const { save, loading } = useBroadcastSaveAsTemplate();

  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    if (await save(name)) {
      setName('');
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="secondary" type="button">
          <IconTemplate />
          {t('saveAsTemplate')}
        </Button>
      </Popover.Trigger>
      <Popover.Content className="flex flex-col gap-2 w-80">
        <Input
          placeholder={t('saveAsTemplatePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          type="button"
          disabled={!name || loading}
          onClick={handleSave}
          className="w-full"
        >
          {loading ? t('saveAsTemplateSaving') : t('saveAsTemplateAction')}
        </Button>
      </Popover.Content>
    </Popover>
  );
};
