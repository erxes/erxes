import { IFacebookBotHealth } from '@/integrations/facebook/types/FacebookBot';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Badge, Popover, RecordTableInlineCell } from 'erxes-ui';
import { useFacebookBotHealthCell } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotHealthCell';

export const FacebookBotHealthCell = ({
  health,
}: {
  health?: IFacebookBotHealth;
}) => {
  const {
    statusLabel,
    statusVariant,
    showDetails,
    detailItems,
  } = useFacebookBotHealthCell(health);

  return (
    <RecordTableInlineCell className="min-w-0">
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <Badge variant={statusVariant}>{statusLabel}</Badge>
        {showDetails ? (
          <Popover>
            <Popover.Trigger asChild>
              <button
                type="button"
                className="inline-flex items-center text-destructive"
              >
                <IconAlertTriangle className="size-4" />
              </button>
            </Popover.Trigger>
            <Popover.Content align="end" className="w-80 space-y-3">
              <div className="space-y-1">
                <div className="text-sm font-medium">Bot health</div>
                <div className="text-xs text-muted-foreground">
                  Current verification details
                </div>
              </div>

              <div className="space-y-2">
                {detailItems.map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      {item.label}
                    </div>
                    <div className="text-sm break-words">{item.value}</div>
                  </div>
                ))}
              </div>
            </Popover.Content>
          </Popover>
        ) : null}
      </div>
    </RecordTableInlineCell>
  );
};
