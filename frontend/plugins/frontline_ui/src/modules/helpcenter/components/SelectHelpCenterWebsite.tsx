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

type TClientPortalOption = { _id: string; domain?: string };

type TClientPortalOptionsResponse = {
  getClientPortals: { list: TClientPortalOption[] } | null;
};

type TWebsiteOption = { _id: string; domain: string };

const toWebsiteOptions = (portals: TClientPortalOption[]): TWebsiteOption[] => {
  const byDomain = new Map<string, TWebsiteOption>();

  for (const portal of portals) {
    const domain = portal.domain?.trim();

    if (!domain || byDomain.has(domain)) {
      continue;
    }

    byDomain.set(domain, { _id: portal._id, domain });
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
  onValueChange: (domain: string) => void;
  variant: 'table' | 'form';
  scope?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  const { data, loading } = useQuery<TClientPortalOptionsResponse>(
    GET_HELP_CENTER_WEBSITE_OPTIONS,
  );

  const websites = useMemo(
    () => toWebsiteOptions(data?.getClientPortals?.list ?? []),
    [data],
  );

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
            <Combobox.Empty loading={loading} />
            {websites.map((website) => (
              <Command.Item
                key={website._id}
                value={website.domain}
                onSelect={() => {
                  onValueChange(website.domain);
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
