import { IconTemplate } from '@tabler/icons-react';
import { Button, Input, Popover, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useBroadcastEmailTemplateAdd } from '../hooks/useBroadcastEmailTemplateAdd';

export const BroadcastSaveAsTemplate = () => {
  const { getValues } = useFormContext();
  const { toast } = useToast();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const { addEmailTemplate, loading } = useBroadcastEmailTemplateAdd();

  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    const contentJson = getValues('email.contentJson');

    addEmailTemplate({
      variables: { name, contentJson },
      onCompleted: () => {
        toast({
          variant: 'default',
          title: t('saveAsTemplateSuccess', { name }),
        });
        setName('');
        setOpen(false);
      },
      onError: (error) => {
        toast({ variant: 'destructive', title: error.message });
      },
    });
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
