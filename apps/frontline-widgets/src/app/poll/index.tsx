import { Button, Dialog, Skeleton, cn } from 'erxes-ui';
import { getVisitorId, postMessage } from '@libs/utils';
import { useCallback, useEffect, useState } from 'react';
import { usePollWidget } from './hooks/usePollWidget';
import { TPollWidgetSettings } from './types';

const STORAGE_PREFIX = 'erxes_poll_answered_';

export const Poll = () => {
  const [settings, setSettings] = useState<TPollWidgetSettings | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [answered, setAnswered] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { connectPoll, submitPoll, poll, loading, submitting } =
    usePollWidget();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const data = event.data || {};

      if (!data.fromPublisher) {
        return;
      }

      if (data.settings) {
        setSettings(data.settings);
      }

      if (data.action === 'showPoll') {
        setIsOpen(true);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!settings?.poll_id || !settings?.channel_id) {
      return;
    }

    const connect = async () => {
      const cachedCustomerId = await getVisitorId();

      const result = await connectPoll({
        variables: {
          channelId: settings.channel_id,
          pollCode: settings.poll_id,
          cachedCustomerId,
        },
      }).catch(() => null);

      const connected = result?.data?.widgetsPollConnect;

      if (!connected?.poll) {
        return;
      }

      const alreadyAnswered =
        connected.votedOptionIds.length > 0 ||
        localStorage.getItem(`${STORAGE_PREFIX}${connected.poll._id}`) ===
          'true';

      postMessage('fromPolls', 'connected', { settings });

      if (alreadyAnswered) {
        setAnswered(true);
        setSelected(connected.votedOptionIds);
        return;
      }

      setIsOpen(true);
    };

    connect();
  }, [connectPoll, settings]);

  useEffect(() => {
    if (!settings?.poll_id) {
      return;
    }

    postMessage('fromPolls', 'changeContainerClass', {
      className: isOpen ? 'erxes-modal-iframe' : 'erxes-modal-iframe hidden',
      settings,
    });
  }, [isOpen, settings]);

  const toggleOption = useCallback(
    (optionId: string) => {
      setSubmitError(null);
      setSelected((prev) => {
        if (poll?.allowMultiselect) {
          return prev.includes(optionId)
            ? prev.filter((id) => id !== optionId)
            : [...prev, optionId];
        }

        return prev.includes(optionId) ? [] : [optionId];
      });
    },
    [poll?.allowMultiselect],
  );

  const handleSubmit = async () => {
    if (!poll || !settings || selected.length === 0) {
      return;
    }

    try {
      const cachedCustomerId = await getVisitorId();

      const result = await submitPoll({
        variables: {
          pollCode: settings.poll_id,
          optionIds: selected,
          cachedCustomerId,
        },
      });

      localStorage.setItem(`${STORAGE_PREFIX}${poll._id}`, 'true');
      setAnswered(true);

      postMessage('fromPolls', 'submitResponse', {
        settings,
        status: result?.data?.widgetsPollSubmit?.status,
      });
    } catch (error) {
      setSubmitError((error as Error).message);
    }
  };

  if (!settings) {
    return null;
  }

  if (loading) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (!poll) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content className="max-w-sm">
        <Dialog.Header>
          <Dialog.Title>{poll.question}</Dialog.Title>
          <Dialog.Description>
            {answered
              ? 'Thanks for your answer.'
              : poll.allowMultiselect
                ? 'Select one or more answers.'
                : 'Select one answer.'}
          </Dialog.Description>
        </Dialog.Header>

        <div className="flex flex-col gap-1.5 py-1">
          {poll.options.map((option) => {
            const isSelected = selected.includes(option._id);

            return (
              <button
                key={option._id}
                type="button"
                disabled={answered || submitting}
                onClick={() => toggleOption(option._id)}
                className={cn(
                  'rounded border px-3 py-2 text-left text-sm',
                  isSelected && 'border-primary bg-primary/10',
                  !answered && 'hover:bg-accent',
                  answered && 'cursor-default opacity-80',
                )}
              >
                {option.text}
              </button>
            );
          })}
        </div>

        {submitError && (
          <p className="text-sm text-destructive">{submitError}</p>
        )}

        <Dialog.Footer>
          {answered ? (
            <Button onClick={() => setIsOpen(false)}>Close</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setIsOpen(false)}>
                Not now
              </Button>
              <Button
                disabled={selected.length === 0 || submitting}
                onClick={handleSubmit}
              >
                Vote
              </Button>
            </>
          )}
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
