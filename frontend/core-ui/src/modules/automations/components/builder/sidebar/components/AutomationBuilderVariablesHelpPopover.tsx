import { IconInfoCircle } from '@tabler/icons-react';
import { Button, Popover } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const AutomationBuilderVariablesHelpPopover = () => {
  const { t } = useTranslation('automations');

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground hover:text-foreground"
          aria-label={t('variables-help-aria-label')}
        >
          <IconInfoCircle className="size-4" />
        </Button>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-80 p-4">
        <div className="space-y-3">
          <div>
            <div className="text-sm font-semibold text-foreground">
              {t('variables-help-title')}
            </div>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              {t('variables-help-description')}
            </p>
          </div>

          <div className="space-y-2 rounded-md border bg-muted/30 p-3 text-sm">
            <div className="font-medium text-foreground">
              {t('variables-help-steps-title')}
            </div>
            <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
              <li>{t('variables-help-step-select-node')}</li>
              <li>{t('variables-help-step-search-output')}</li>
              <li>{t('variables-help-step-insert-variable')}</li>
            </ul>
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
};
