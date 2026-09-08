import { IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react';
import { Popover, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TTriggerClaim } from '../../hooks/useFacebookBotTriggerClaims';

/**
 * Names the automations already listening for the same thing. The row it sits
 * on may be dimmed, so this stays at full opacity — it is the way out.
 */
export const TriggerClaimNote = ({
  claims,
  className,
}: {
  claims?: TTriggerClaim[];
  className?: string;
}) => {
  const { t } = useTranslation('frontline');

  if (!claims?.length) {
    return null;
  }

  const active = claims.filter(({ isActive }) => isActive);
  const shown = active.length ? active : claims;
  const names = shown.map(({ name }) => name).join(', ');

  const message = active.length
    ? t('trigger-claim-active', {
        defaultValue:
          'Taken by {{names}}. Two active automations would both reply, so turn it off there to use it here.',
        names,
      })
    : t('trigger-claim-draft', {
        defaultValue: 'Taken by {{names}} (draft). Remove it there to use it here.',
        names,
      });

  return (
    <Popover>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={message}
          className={cn(
            'inline-flex shrink-0 items-center opacity-100 transition-colors',
            active.length
              ? 'text-warning hover:text-warning/80'
              : 'text-muted-foreground hover:text-foreground',
            className,
          )}
        >
          {active.length ? (
            <IconAlertTriangle className="size-4" />
          ) : (
            <IconInfoCircle className="size-4" />
          )}
        </button>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-72 p-3 text-sm font-normal">
        {message}
      </Popover.Content>
    </Popover>
  );
};
