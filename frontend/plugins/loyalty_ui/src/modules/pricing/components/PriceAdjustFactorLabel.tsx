import { IconInfoCircle } from '@tabler/icons-react';
import { Button, Form, Tooltip } from 'erxes-ui';
import { type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export const PriceAdjustFactorLabel = (): ReactElement => {
  const { t } = useTranslation('loyalty');

  return (
    <div className="flex items-center gap-1">
      <Form.Label>{t('price-adjust-factor')}</Form.Label>
      <Tooltip.Provider>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-5 text-muted-foreground"
              aria-label={t('price-adjust-factor-help')}
            >
              <IconInfoCircle className="size-4" aria-hidden="true" />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content className="max-w-80 space-y-2 text-xs" side="top">
            <p>{t('price-adjust-factor-steps')}</p>
            <p>{t('price-adjust-factor-limit')}</p>
          </Tooltip.Content>
        </Tooltip>
      </Tooltip.Provider>
    </div>
  );
};
