import { AutomationCanvasControlButton } from '@/automations/components/builder/controls/AutomationCanvasControlButton';
import { useAutomationDuplicateAction } from '@/automations/components/builder/hooks/useAutomationDuplicateAction';
import { IconCopy } from '@tabler/icons-react';
import { AlertDialog, Input, Label, Spinner } from 'erxes-ui';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const AutomationCanvasDuplicateAction = () => {
  const { t } = useTranslation('automations');
  const {
    duplicating,
    isOpen,
    name,
    onDuplicate,
    open,
    setName,
    setOpen,
    suggestedName,
  } = useAutomationDuplicateAction();

  return (
    <Can action="automationsCreate">
      <AutomationCanvasControlButton
        label={t('controls-duplicate-automation')}
        disabled={duplicating}
        onClick={open}
      >
        {duplicating ? <Spinner /> : <IconCopy />}
      </AutomationCanvasControlButton>

      <AlertDialog open={isOpen} onOpenChange={setOpen}>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>
              {t('controls-duplicate-title')}
            </AlertDialog.Title>
            <AlertDialog.Description>
              {t('controls-duplicate-description')}
            </AlertDialog.Description>
          </AlertDialog.Header>

          <div className="space-y-2">
            <Label htmlFor="duplicate-name">{t('name')}</Label>
            <Input
              id="duplicate-name"
              autoFocus
              value={name}
              placeholder={suggestedName}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onDuplicate();
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              {t('controls-duplicate-name-hint', { name: suggestedName })}
            </p>
          </div>

          <AlertDialog.Footer>
            <AlertDialog.Cancel>{t('cancel')}</AlertDialog.Cancel>
            <AlertDialog.Action
              disabled={duplicating}
              onClick={(event) => {
                event.preventDefault();
                onDuplicate();
              }}
            >
              {duplicating ? <Spinner /> : null}
              {t('duplicate')}
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </Can>
  );
};
