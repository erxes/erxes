import { useBroadcastFromAddress } from '@/broadcast/hooks/useBroadcastFromAddress';
import { Input, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const BroadcastFromAddress = ({
  value,
  onChange,
  domains,
  fallbackAddress,
}: {
  value?: string;
  onChange: (value: string) => void;
  domains: string[];
  fallbackAddress: string;
}) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });
  const { local, domain, options, verified, changeLocal, changeDomain } =
    useBroadcastFromAddress({ value, onChange, domains });

  return (
    <div className="flex flex-col gap-1">
      <div className="flex">
        <Input
          value={local}
          onChange={(event) => changeLocal(event.target.value)}
          placeholder={t('from-local-placeholder')}
          aria-label={t('from-address')}
          className="min-w-0 rounded-r-none"
        />
        {/* a long domain is cut short so the name before @ keeps its room */}
        {options.length > 1 ? (
          <Select value={domain} onValueChange={changeDomain}>
            <Select.Trigger
              title={`@${domain}`}
              className="w-auto min-w-0 max-w-[55%] shrink-0 gap-1 rounded-l-none bg-muted font-normal text-muted-foreground"
            >
              <span className="min-w-0 truncate">@{domain}</span>
            </Select.Trigger>
            <Select.Content>
              {options.map((option) => (
                <Select.Item key={option} value={option}>
                  @{option}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        ) : (
          <span
            title={`@${domain}`}
            className="flex h-7 min-w-0 max-w-[55%] shrink-0 items-center rounded-r-sm bg-muted px-3 text-sm text-muted-foreground shadow-xs"
          >
            <span className="truncate">@{domain}</span>
          </span>
        )}
      </div>
      {!verified && (
        <p className="text-xs text-warning">
          {t('from-domain-unverified', { domain, address: fallbackAddress })}
        </p>
      )}
    </div>
  );
};
