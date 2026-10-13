import { NodeData } from '@/automations/types';
import { Checkbox, Label } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useTriggerReEnrollment } from '../hooks/useTriggerReEnrollment';

/** "Run every time it happens", for triggers whose events are occurrences. */
export const AutomationTriggerEveryTime = ({
  activeNode,
}: {
  activeNode: NodeData;
}) => {
  const { t } = useTranslation('automations');
  const { everyTimeOffered, alwaysRuns, everyTime, setEveryTime } =
    useTriggerReEnrollment(activeNode);

  if (!everyTimeOffered || alwaysRuns) {
    return null;
  }

  return (
    <div className="flex items-start gap-2 px-4 pt-4">
      <Checkbox
        id={`reEnrollEveryTime-${activeNode.id}`}
        checked={everyTime}
        onCheckedChange={(value) => setEveryTime(value === true)}
        className="mt-0.5"
      />
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={`reEnrollEveryTime-${activeNode.id}`}>
          {t('re-enrollment-every-time')}
        </Label>
        <span className="text-xs text-muted-foreground">
          {t('re-enrollment-every-time-hint')}
        </span>
      </div>
    </div>
  );
};
