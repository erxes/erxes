import { IconCircleX } from '@tabler/icons-react';
import { Button, Dialog, Spinner, Textarea, toast } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSurveyToggleStatus } from '@/survey/hooks/useSurveyMutations';
import {
  MAX_REJECTION_REASON_LENGTH,
  SURVEY_STATUS,
} from '@/survey/types/surveyTypes';

export const SurveyRejectDialog = ({
  open,
  onOpenChange,
  surveyIds,
  onRejected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  surveyIds: string[];
  onRejected?: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const [reason, setReason] = useState('');
  const { toggleSurveyStatus, loading } = useSurveyToggleStatus();

  useEffect(() => {
    if (!open) {
      setReason('');
    }
  }, [open]);

  const count = surveyIds.length;
  const trimmedReason = reason.trim();
  const canReject = !!trimmedReason && count > 0;

  const handleReject = () => {
    if (!canReject) {
      return;
    }

    toggleSurveyStatus({
      variables: {
        _ids: surveyIds,
        status: SURVEY_STATUS.REJECTED,
        reason: trimmedReason,
      },
      onCompleted: () => {
        toast({
          variant: 'success',
          title: t('survey-rejected', 'Survey rejected'),
        });
        onRejected?.();
        onOpenChange(false);
      },
      onError: (error) =>
        toast({
          title: t('error', 'Error'),
          variant: 'destructive',
          description: error.message,
        }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{t('survey-reject', 'Reject')}</Dialog.Title>
          <Dialog.Description>
            {t('survey-reject-description', {
              defaultValue:
                'Tell the requester why {{count}} survey request is rejected. They keep the request and can revise it.',
              defaultValue_other:
                'Tell the requester why {{count}} survey requests are rejected. They keep the requests and can revise them.',
              count,
            })}
          </Dialog.Description>
        </Dialog.Header>

        <div className="flex flex-col gap-1.5 py-2">
          <span className="text-sm font-medium">
            {t('survey-rejection-reason', 'Reason')}
          </span>
          <Textarea
            value={reason}
            maxLength={MAX_REJECTION_REASON_LENGTH}
            autoFocus
            placeholder={t(
              'survey-rejection-reason-placeholder',
              'What needs to change before this survey can go out?',
            )}
            onChange={(event) => setReason(event.target.value)}
          />
          <span className="text-xs text-muted-foreground">
            {`${reason.length}/${MAX_REJECTION_REASON_LENGTH}`}
          </span>
        </div>

        <Dialog.Footer>
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            variant="destructive"
            disabled={!canReject || loading}
            onClick={handleReject}
          >
            {loading ? <Spinner size="sm" /> : <IconCircleX />}
            {t('survey-reject', 'Reject')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
