import { IconTemplate } from '@tabler/icons-react';
import { Button, Input, Popover } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBroadcastSaveAsTemplateForm } from '../hooks/useBroadcastSaveAsTemplateForm';

export const BroadcastSaveAsTemplate = () => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const {
    open,
    setOpen,
    name,
    onNameChange,
    saveDisabled,
    saveLabelKey,
    handleSave,
  } = useBroadcastSaveAsTemplateForm();

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
          onChange={onNameChange}
        />
        <Button
          type="button"
          disabled={saveDisabled}
          onClick={handleSave}
          className="w-full"
        >
          {t(saveLabelKey)}
        </Button>
      </Popover.Content>
    </Popover>
  );
};
