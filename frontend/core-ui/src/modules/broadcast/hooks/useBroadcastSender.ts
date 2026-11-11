import { domainOf } from '@/broadcast/utils/senderAddress';
import { useSenderOptions } from '@/settings/mail-config/hooks/useVerifiedSenders';
import { AppPath } from '@/types/paths/AppPath';
import { SettingsWorkspacePath } from '@/types/paths/SettingsPath';
import { useVersion } from 'ui-modules';

export type TBroadcastSenderMode = 'locked' | 'domains' | 'free';

export type TBroadcastSenderLock = 'shared' | 'unsupported' | 'unverified';

const resolveMode = (
  alignedFrom: string | null,
  domains: string[],
): TBroadcastSenderMode => {
  if (alignedFrom) {
    return 'locked';
  }

  return domains.length ? 'domains' : 'free';
};

const resolveLock = (
  isSaas: boolean,
  canVerifySenders: boolean,
): TBroadcastSenderLock => {
  if (isSaas) {
    return 'shared';
  }

  return canVerifySenders ? 'unverified' : 'unsupported';
};

/**
 * How the From can be written. "locked": mail goes out from the default
 * sender, and the reply-to speaks for it; "domains": any address on a
 * verified domain; "free": no default sender to fall back to, so the publish
 * check decides.
 */
export const useBroadcastSender = () => {
  const isSaas = useVersion('saas');
  const {
    alignedFrom,
    defaultSenderEmail,
    verifiedDomains,
    supportsSenderVerification,
    sameAsMailConfig,
    loading,
  } = useSenderOptions();

  const defaultDomain = domainOf(defaultSenderEmail);

  // the default domain leads; the rest keep the order they came in
  const domains = [...(verifiedDomains || [])].sort(
    (a, b) => Number(b === defaultDomain) - Number(a === defaultDomain),
  );

  const settingsPage = sameAsMailConfig
    ? SettingsWorkspacePath.MailConfig
    : SettingsWorkspacePath.Broadcast;

  return {
    mode: resolveMode(alignedFrom, domains),
    lock: resolveLock(isSaas, supportsSenderVerification),
    domains,
    defaultSenderEmail,
    lockedAddress: alignedFrom || '',
    canVerifySenders: supportsSenderVerification,
    settingsPath: `/${AppPath.Settings}/${settingsPage}`,
    loading,
  };
};
