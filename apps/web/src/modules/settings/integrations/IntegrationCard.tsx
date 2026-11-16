import type { Icon } from '@tabler/icons-react';
import { Badge } from 'erxes-ui';
import { type ReactNode, useId } from 'react';
import { useTranslation } from 'react-i18next';

/** Not set up yet, or set up and turned on or off. */
export type IntegrationState = 'not-set-up' | 'on' | 'off';

/** One integration on Settings › Integrations: what it is, its state and its actions. */
export const IntegrationCard = ({
  icon: IntegrationIcon,
  title,
  description,
  state,
  details,
  actions,
}: {
  icon: Icon;
  title: string;
  description: string;
  state: IntegrationState;
  /** What it is connected to, once set up. */
  details?: ReactNode;
  actions: ReactNode;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const id = useId();

  return (
    <section aria-labelledby={id} className="flex items-start gap-4 rounded-lg border p-4">
      <IntegrationIcon className="mt-0.5 size-8 shrink-0 text-primary" />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h2 id={id} className="font-medium">
            {title}
          </h2>
          <Badge variant={state === 'on' ? 'success' : 'secondary'}>
            {state === 'on'
              ? t('on', 'On')
              : state === 'off'
                ? t('off', 'Off')
                : t('not-set-up', 'Not set up')}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        {details && <p className="text-xs text-muted-foreground">{details}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">{actions}</div>
    </section>
  );
};
