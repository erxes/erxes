import { domainOf } from '@/broadcast/utils/senderAddress';
import { useState } from 'react';

export const useBroadcastFromAddress = ({
  value = '',
  onChange,
  domains,
}: {
  value?: string;
  onChange: (value: string) => void;
  domains: string[];
}) => {
  const [pickedDomain, setPickedDomain] = useState('');

  const local = value.split('@')[0] || '';
  const domain = domainOf(value) || pickedDomain || domains[0] || '';

  // a saved From on a domain no longer verified stays visible, not swapped
  const options =
    domain && !domains.includes(domain) ? [...domains, domain] : domains;

  const compose = (nextLocal: string, nextDomain: string) =>
    onChange(nextLocal ? `${nextLocal}@${nextDomain}` : '');

  const changeLocal = (input: string) => {
    // a pasted address keeps its own domain when that one is verified
    const [name = '', host = ''] = input.trim().split('@');
    const nextDomain = domains.includes(host.toLowerCase())
      ? host.toLowerCase()
      : domain;

    setPickedDomain(nextDomain);
    compose(name, nextDomain);
  };

  const changeDomain = (nextDomain: string) => {
    setPickedDomain(nextDomain);
    compose(local, nextDomain);
  };

  return {
    local,
    domain,
    options,
    verified: domains.includes(domain),
    changeLocal,
    changeDomain,
  };
};
