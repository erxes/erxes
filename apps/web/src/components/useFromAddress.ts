import type { EmailSender } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';

const split = (address: string) => {
  const at = address.lastIndexOf('@');

  return at < 0
    ? { local: address, domain: '' }
    : { local: address.slice(0, at), domain: address.slice(at + 1) };
};

/** A saved From the organisation may not send from: not its settings' own, nor on a verified domain. */
const staleFrom = (value: string | null | undefined, sender: EmailSender | undefined) =>
  !!value &&
  !!sender &&
  value.toLowerCase() !== sender.address.toLowerCase() &&
  !sender.domains.includes(split(value).domain.toLowerCase());

/** Whether sending refuses the saved From until it is fixed (`useFromAddress` shows why). */
export const useFromStale = (value: string | null | undefined) => {
  const sender = useQuery(orpc.emails.sender.queryOptions());

  return staleFrom(value, sender.data);
};

/**
 * The From address an email asks for (self-hosted, through its own SendGrid or SES): any local
 * part on a domain the provider verified, or null for the settings' own address. `stale` when
 * the saved one's domain isn't verified any more: sending refuses it until it is fixed.
 */
export const useFromAddress = (
  value: string | null | undefined,
  onChange: (next: string | null) => void,
) => {
  const sender = useQuery(orpc.emails.sender.queryOptions());
  const domains = sender.data?.domains ?? [];
  const own = sender.data?.address ?? '';
  const ownParts = split(own);
  const saved = value ? split(value) : null;

  const domain =
    saved?.domain || (domains.includes(ownParts.domain) ? ownParts.domain : (domains[0] ?? ''));

  const stale = staleFrom(value, sender.data);

  // The settings' own address is the default: it is kept as null, so it follows Settings.
  const pick = (local: string, at: string) => {
    const address = `${local.replace(/[\s@]/g, '').toLowerCase()}@${at}`;

    onChange(!local.trim() || address === own.toLowerCase() ? null : address);
  };

  return {
    /** Something to pick: verified domains, or a saved address to show. */
    shown: domains.length > 0 || !!value,
    provider: sender.data?.provider,
    own,
    local: saved?.local ?? '',
    domain,
    // A dropped domain stays listed, so the editor sees what is saved.
    options: stale && saved ? [...domains, saved.domain] : domains,
    placeholder: ownParts.local,
    stale,
    setLocal: (local: string) => pick(local, domain),
    setDomain: (at: string) => pick(saved?.local || ownParts.local, at),
    clear: () => onChange(null),
  };
};

export type FromAddress = ReturnType<typeof useFromAddress>;
