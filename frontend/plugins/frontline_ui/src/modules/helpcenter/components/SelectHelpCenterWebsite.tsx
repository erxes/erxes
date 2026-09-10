import { useQuery } from '@apollo/client';
import {
  Combobox,
  Command,
  PopoverScoped,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GET_HELP_CENTER_WEBSITE_OPTIONS } from '@/helpcenter/graphql/queries/getHelpCenterWebsiteOptions';
import { SelectTriggerTicket } from '@/ticket/components/ticket-selects/SelectTicket';

type TClientPortalOption = { _id: string; domain?: string; token?: string };

type TClientPortalOptionsResponse = {
  getClientPortals: { list: TClientPortalOption[] } | null;
};

type TWebsiteOption = { _id: string; domain: string; erxesAppToken: string };

const toWebsiteOptions = (portals: TClientPortalOption[]): TWebsiteOption[] => {
  const byDomain = new Map<string, TWebsiteOption>();

  for (const portal of portals) {
    const domain = portal.domain?.trim();

    if (!domain || byDomain.has(domain)) {
      continue;
    }

    byDomain.set(domain, {
      _id: portal._id,
      domain,
      erxesAppToken: portal.token ?? '',
    });
  }

  return [...byDomain.values()];
};

export const SelectHelpCenterWebsite = ({
  value,
  onValueChange,
  variant,
  scope,
}: {
  value: string;
  onValueChange: (domain: string, erxesAppToken: string) => void;
  variant: 'table' | 'form';
  scope?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  const { data, error, loading } = useQuery<TClientPortalOptionsResponse>(
    GET_HELP_CENTER_WEBSITE_OPTIONS,
  );

  const portals = useMemo(() => data?.getClientPortals?.list ?? [], [data]);

  const websites = useMemo(() => toWebsiteOptions(portals), [portals]);

  const noDomains =
    !loading && !error && portals.length > 0 && !websites.length;

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <SelectTriggerTicket variant={variant}>
        <TextOverflowTooltip
          value={value || t('select-website', 'Select a client portal')}
        />
      </SelectTriggerTicket>
      <Combobox.Content>
        <Command>
          <Command.Input
            placeholder={t('search-websites', 'Search client portals')}
          />
          <Command.List>
            {noDomains ? (
              <p className="text-muted-foreground p-8 text-center">
                {t(
                  'help-center-website-no-domains',
                  'No client portal has a domain yet. Add one in the client portal settings to publish a help center on it.',
                )}
              </p>
            ) : (
              <Combobox.Empty loading={loading} error={error} />
            )}
            {websites.map((website) => (
              <Command.Item
                key={website._id}
                value={website.domain}
                onSelect={() => {
                  onValueChange(website.domain, website.erxesAppToken);
                  setOpen(false);
                }}
              >
                <TextOverflowTooltip value={website.domain} />
                <Combobox.Check checked={value === website.domain} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </PopoverScoped>
  );
};
