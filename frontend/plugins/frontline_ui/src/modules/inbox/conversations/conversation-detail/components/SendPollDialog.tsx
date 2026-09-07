import { IconChartBar, IconSearch } from '@tabler/icons-react';
import { Button, Dialog, Input, Skeleton, Spinner, toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { usePollList } from '@/poll/hooks/usePollList';
import { usePollSendToConversation } from '@/poll/hooks/usePollMutations';
import { POLL_STATUS } from '@/poll/types/pollTypes';
import { FrontlinePaths } from '@/types/FrontlinePaths';

export const SendPollDialog = ({
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

  const { polls, loading } = usePollList({
    variables: {
      status: POLL_STATUS.ACTIVE,
      searchValue: searchValue || undefined,
      channelId,
    },
    skip: !open,
  });

  const { sendPoll, loading: sending } = usePollSendToConversation();

  const handleSend = (pollId: string) => {
    if (!conversationId) {
      return;
    }

    sendPoll({
      variables: { _id: pollId, conversationId },
      onCompleted: () => {
        toast({ variant: 'success', title: t('poll-sent') });
        setOpen(false);
        setSearchValue('');
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('poll-send-failed'),
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
          title={t('send-poll')}
        >
          <IconChartBar className="h-4 w-4" />
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{t('send-poll')}</Dialog.Title>
          <Dialog.Description>{t('send-poll-description')}</Dialog.Description>
        </Dialog.Header>

        <div className="flex flex-col gap-3 py-2">
          <div className="relative">
            <IconSearch className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              className="pl-8"
              placeholder={t('search-polls')}
              onChange={(event) => setSearchValue(event.target.value)}
            />
          </div>

          <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
            {loading && !polls ? (
              <>
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </>
            ) : polls?.length ? (
              polls.map((poll) => (
                <button
                  key={poll._id}
                  type="button"
                  disabled={sending}
                  onClick={() => handleSend(poll._id)}
                  className="flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left hover:bg-accent disabled:opacity-60"
                >
                  <span className="text-sm font-medium">{poll.title}</span>
                  <span className="line-clamp-1 text-xs text-muted-foreground">
                    {poll.question}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t('n-options', { count: poll.options?.length || 0 })}
                  </span>
                </button>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t('no-active-polls')}
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
                  ? `/settings/${FrontlinePaths.Frontline}${FrontlinePaths.Channels}/${channelId}/polls`
                  : `/settings/${FrontlinePaths.Frontline}${FrontlinePaths.Channels}`
              }
            >
              {t('manage-polls')}
            </Link>
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
