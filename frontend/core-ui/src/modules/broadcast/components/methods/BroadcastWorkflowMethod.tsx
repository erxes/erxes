import {
  IconAffiliate,
  IconArrowsSplit2,
  IconUsers,
} from '@tabler/icons-react';
import { Card } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const STEPS = [
  { icon: IconUsers, key: 'loop' },
  { icon: IconArrowsSplit2, key: 'draw' },
  { icon: IconAffiliate, key: 'live' },
];

/**
 * A workflow campaign has nothing to fill in here: its content is the flow,
 * and the flow is drawn in the automation builder once the campaign exists.
 */
export const BroadcastWorkflowMethod = () => {
  const { t } = useTranslation('broadcasts');

  return (
    <div className="flex h-full flex-col gap-3">
      {STEPS.map(({ icon: Icon, key }) => (
        <Card key={key} className="flex gap-3 border p-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium">{t(`workflow.method.${key}`)}</p>
            <p className="text-sm text-muted-foreground">
              {t(`workflow.method.${key}-body`)}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};
