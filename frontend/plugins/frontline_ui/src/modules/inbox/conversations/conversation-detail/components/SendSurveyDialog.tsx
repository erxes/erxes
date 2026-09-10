import { IconChartBar, IconSearch } from '@tabler/icons-react';
import { Button, Dialog, Input, Skeleton, Spinner, toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSurveyList } from '@/survey/hooks/useSurveyList';
import { useSurveySendToConversation } from '@/survey/hooks/useSurveyMutations';
import { SURVEY_STATUS } from '@/survey/types/surveyTypes';
import { FrontlinePaths } from '@/types/FrontlinePaths';

export const SendSurveyDialog = ({
  conversationId,
  channelId,
  disabled,
}: {
  conversationId?: string;
  channelId?: string;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const { surveys, loading } = useSurveyList({
    variables: {
      status: SURVEY_STATUS.ACTIVE,
      searchValue: searchValue || undefined,
      channelId,
    },
    skip: !open,
  });

  const { sendSurvey, loading: sending } = useSurveySendToConversation();

  const handleSend = (surveyId: string) => {
    if (!conversationId) {
      return;
    }

    sendSurvey({
      variables: { _id: surveyId, conversationId },
      onCompleted: () => {
        toast({ variant: 'success', title: t('survey-sent', 'Survey sent') });
        setOpen(false);
        setSearchValue('');
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('survey-send-failed', 'Failed to send survey'),
          description: error.message,
        }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="h-8 w-8 flex-none rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          title={t('send-survey', 'Send survey')}
        >
          <IconChartBar className="h-4 w-4" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{t('send-survey', 'Send survey')}</Dialog.Title>
          <Dialog.Description>
            {t(
              'send-survey-description',
              'Pick an active survey to post into this conversation.',
            )}
          </Dialog.Description>
        </Dialog.Header>

        <div className="flex flex-col gap-3 py-2">
          <div className="relative">
            <IconSearch className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              className="pl-8"
              placeholder={t('search-surveys', 'Search surveys')}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>

          <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
            {loading && !surveys ? (
              <>
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </>
            ) : surveys?.length ? (
              surveys.map((survey) => (
                <button
                  key={survey._id}
                  type="button"
                  disabled={sending}
                  onClick={() => handleSend(survey._id)}
                  className="flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left hover:bg-accent disabled:opacity-60"
                >
                  <span className="text-sm font-medium">{survey.title}</span>
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {survey.question}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(survey.steps?.length || 1) > 1
                      ? t('n-steps', '{{count}} steps', {
                          count: survey.steps?.length,
                        })
                      : t('n-options', { count: survey.options?.length || 0 })}
                  </span>
                </button>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t('no-active-surveys', 'No active surveys yet.')}
              </p>
            )}
          </div>
        </div>

        <Dialog.Footer>
          {sending && <Spinner size="sm" />}
          <Button variant="outline" asChild>
            <Link
              to={
                channelId
                  ? `/settings/${FrontlinePaths.Frontline}${FrontlinePaths.Channels}/${channelId}/surveys`
                  : `/settings/${FrontlinePaths.Frontline}${FrontlinePaths.Channels}`
              }
            >
              {t('manage-surveys', 'Manage surveys')}
            </Link>
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
