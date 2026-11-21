import { messageOf, orpc } from '@erxes/core-contract/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useConfirm, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/** The sending ramp, refreshed every minute while the page is open. */
export const useEmailLimits = () =>
  useQuery(orpc.emails.limits.queryOptions({ refetchInterval: 60_000 }));

/** Success refreshes everything email; an error is a toast. */
const useLimitsHandlers = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.limits' });
  const { toast } = useToast();
  const client = useQueryClient();

  return {
    refresh: () => client.invalidateQueries({ queryKey: orpc.emails.key() }),
    onError: (error: unknown) =>
      toast({
        variant: 'destructive',
        title: t('failed', 'Could not change sending'),
        description: messageOf(error),
      }),
  };
};

/** Resuming halted sending: the dialog, the reason typed into it, and the call. */
export const useResumeSending = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.limits' });
  const { toast } = useToast();
  const { refresh, onError } = useLimitsHandlers();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');

  const resume = useMutation(
    orpc.emails.resumeSending.mutationOptions({
      onSuccess: () => {
        setOpen(false);
        setReason('');
        toast({ title: t('resumed', 'Sending resumed') });

        return refresh();
      },
      onError,
    }),
  );

  return {
    open,
    setOpen,
    reason,
    setReason,
    pending: resume.isPending,
    canSubmit: reason.trim().length > 0 && !resume.isPending,
    submit: () => resume.mutate({ reason: reason.trim() }),
  };
};

export type ResumeSending = ReturnType<typeof useResumeSending>;

/** Turning the ramp off (after the warning) or back on. */
export const useRampToggle = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email.limits' });
  const { confirm } = useConfirm();
  const { refresh, onError } = useLimitsHandlers();

  const set = useMutation(orpc.emails.setRamp.mutationOptions({ onSuccess: refresh, onError }));

  const toggle = (enabled: boolean) => {
    if (enabled) {
      set.mutate({ enabled });

      return;
    }

    void confirm({
      message: t(
        'ramp-off-warning',
        'Your provider may suspend your account if bounces rise; erxes will no longer pace or halt sending.',
      ),
      options: { okLabel: t('ramp-off', 'Turn off') },
    }).then(() => set.mutate({ enabled: false }));
  };

  return { toggle, pending: set.isPending };
};
