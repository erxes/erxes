import { useTranslation } from 'react-i18next';
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { SegmentForm } from 'ui-modules';
import { useSplitConditionFormFooter } from '@/automations/components/builder/nodes/actions/split/hooks/useSplitConditionFormFooter';
import { AUTOMATION_SEGMENT_OWNER } from '@/automations/components/common/AutomationSegmentForm';

export const SplitConditionForm = ({
  contentType,
  segmentId,
  callback,
  onDirtyChange,
}: {
  contentType: string;
  segmentId?: string;
  callback: (contentId: string) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}) => {
  return (
    <SegmentForm.Root
      contentType={contentType}
      segmentId={segmentId}
      ownedBy={AUTOMATION_SEGMENT_OWNER}
    >
      <SegmentForm.Wrapper>
        <SegmentForm.Content>
          <div className="mt-2">
            <SegmentForm.Group path="root" />
          </div>
        </SegmentForm.Content>
        <div>
          <SplitConditionFormFooter
            segmentId={segmentId}
            callback={callback}
            onDirtyChange={onDirtyChange}
          />
        </div>
      </SegmentForm.Wrapper>
    </SegmentForm.Root>
  );
};

const SplitConditionFormFooter = ({
  segmentId,
  callback,
  onDirtyChange,
}: {
  segmentId?: string;
  callback: (contentId: string) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}) => {
  const { t } = useTranslation('automations');
  const { shouldSave, unsavedKey, saveDisabled, onSave } =
    useSplitConditionFormFooter({ segmentId, callback, onDirtyChange });

  return (
    <div className="flex items-center justify-between gap-3 border-t bg-background p-2">
      <div className="flex min-w-0 items-center gap-2 text-xs">
        {shouldSave ? (
          <>
            <IconAlertCircle className="size-4 shrink-0 text-warning" />
            <span className="font-medium text-warning">{t(unsavedKey)}</span>
          </>
        ) : (
          <>
            <IconCircleCheck className="size-4 shrink-0 text-success" />
            <span className="text-muted-foreground">
              {t('split-condition-saved')}
            </span>
          </>
        )}
      </div>
      <Button
        disabled={saveDisabled}
        variant={shouldSave ? 'default' : 'secondary'}
        onClick={onSave}
      >
        {shouldSave ? t('split-save-condition') : t('split-saved')}
      </Button>
    </div>
  );
};
