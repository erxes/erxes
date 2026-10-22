import { IconBrandAws, IconMail, IconPlugConnected } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { CONNECTION_PROVIDERS } from '../providers';

export function ProviderLogo({
  provider,
  className,
}: {
  provider: string;
  className?: string;
}) {
  const logo = CONNECTION_PROVIDERS[provider]?.logo;
  const Icon = ['s3', 'amazon-ses'].includes(provider)
    ? IconBrandAws
    : ['smtp', 'sendgrid'].includes(provider)
    ? IconMail
    : IconPlugConnected;

  return (
    <span
      className={cn(
        'flex size-11 shrink-0 items-center justify-center rounded-xl border',
        logo ? 'bg-white' : 'bg-background',
        className,
      )}
      aria-hidden="true"
    >
      {logo ? (
        <img
          src={logo}
          alt=""
          className="size-7 rounded object-contain"
          width={28}
          height={28}
        />
      ) : (
        <Icon className="size-6" strokeWidth={1.5} />
      )}
    </span>
  );
}
