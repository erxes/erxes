import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { IconAlertTriangle } from '@tabler/icons-react';

/**
 * "Use own credentials" is selected but the values resolve to the mail config's
 * anyway, so campaigns are not actually separated from transactional mail. Says
 * so rather than letting the setting imply an isolation that is not in effect.
 */
export const BroadcastCredentialsNotice = () => {
  const { sameAsMailConfig, loading } = useSenderOptions();

  if (loading || !sameAsMailConfig) {
    return null;
  }

  return (
    <div className="col-span-2 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/6 p-3 text-sm leading-[140%] text-primary">
      <IconAlertTriangle className="size-4 shrink-0 translate-y-0.5" />
      <span>
        These credentials are identical to the ones in Mail config, so campaigns
        still send on that same account. Fill in the fields above to put them on
        a separate one.
      </span>
    </div>
  );
};
