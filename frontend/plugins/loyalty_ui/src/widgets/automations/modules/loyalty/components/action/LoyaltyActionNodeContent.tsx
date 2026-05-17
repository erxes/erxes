import { AutomationActionNodeConfigProps } from 'ui-modules';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { SCORE_ACTION_LABELS } from '../../constants/adjustScoreAction';
import { TAdjustScoreActionConfigForm } from '../../states/adjustScoreActionConfigFormDefinitions';
import { isAdjustScoreActionType } from '../../utils/loyaltyActionUtils';

export const LoyaltyActionNodeContent = ({
  actionData,
  config,
}: AutomationActionNodeConfigProps<TAdjustScoreActionConfigForm>) => {
  if (!isAdjustScoreActionType(actionData?.type)) {
    return null;
  }

  const action = config?.action || 'add';
  const Icon = action === 'subtract' ? IconMinus : IconPlus;

  return (
    <div className="flex items-center gap-2 text-sm text-accent-foreground">
      <span
        className={cn(
          'flex size-5 items-center justify-center rounded bg-muted text-foreground',
          action === 'add' && 'text-success',
          action === 'subtract' && 'text-destructive',
        )}
      >
        <Icon className="size-3.5" />
      </span>
      <span>
        {SCORE_ACTION_LABELS[action]} using{' '}
        {config?.campaignId ? 'score campaign' : 'no campaign selected'}
      </span>
    </div>
  );
};
