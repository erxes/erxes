import { useQuery } from '@apollo/client';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Command,
  PopoverScoped,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GET_HELP_CENTER_WEBSITE_OPTIONS } from '@/helpcenter/graphql/queries/getHelpCenterWebsiteOptions';
import { SelectTriggerTicket } from '@/ticket/components/ticket-selects/SelectTicket';

type TClientPortalOption = {
  _id: string;
  name?: string;
  domain?: string;
  token?: string;
};

type TClientPortalOptionsResponse = {
  getClientPortals: { list: TClientPortalOption[] } | null;
};

export type TClientPortalChoice = {
  _id: string;
  name: string;
  domain: string;
  erxesAppToken: string;
};

const CLIENT_PORTAL_SETTINGS_PATH = '/settings/client-portals';

const toWebsiteOptions = (
  portals: TClientPortalOption[],
): TClientPortalChoice[] => {
  const byDomain = new Map<string, TClientPortalChoice>();

  for (const portal of portals) {
    const domain = portal.domain?.trim();

    if (!domain || byDomain.has(domain)) {
      continue;
    }

    byDomain.set(domain, {
      _id: portal._id,
      name: portal.name?.trim() || domain,
      domain,
      erxesAppToken: portal.token ?? '',
    });
  }

  return [...byDomain.values()];
};

export const SelectHelpCenterClientPortal = ({
  value,
  domain,
  onValueChange,
  variant,
  scope,
}: {
  value: string;
  domain: string;
  onValueChange: (portal: TClientPortalChoice) => void;
  variant: 'table' | 'form';
  scope?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  const { data, error, loading, refetch } =
    useQuery<TClientPortalOptionsResponse>(GET_HELP_CENTER_WEBSITE_OPTIONS);

  const portals = useMemo(() => data?.getClientPortals?.list ?? [], [data]);

  const websites = useMemo(() => toWebsiteOptions(portals), [portals]);

  const noDomains =
    !loading && !error && portals.length > 0 && !websites.length;

  const selected =
    websites.find((website) => website._id === value) ??
    (value ? undefined : websites.find((website) => website.domain === domain));

  return (
    <PopoverScoped
      scope={scope}
      open={open}
      onOpenChange={(next: boolean) => {
        setOpen(next);

        if (next) {
          refetch();
        }
      }}
    >
      <SelectTriggerTicket variant={variant}>
        <TextOverflowTooltip
          value={
            selected?.name ||
            domain ||
            t('select-website', 'Select a client portal')
          }
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
                value={website._id}
                keywords={[website.name, website.domain]}
                onSelect={() => {
                  onValueChange(website);
                  setOpen(false);
                }}
              >
                <TextOverflowTooltip value={website.name} />
                <Combobox.Check checked={selected?._id === website._id} />
              </Command.Item>
            ))}
          </Command.List>
          <div className="p-1 border-t">
            <Button
              type="button"
              variant="ghost"
              className="justify-start w-full"
              onClick={() =>
                window.open(CLIENT_PORTAL_SETTINGS_PATH, '_blank', 'noopener')
              }
            >
              <IconPlus className="mr-2 w-4 h-4" />
              {t('sidebar.client-portal', 'Client portal')}
            </Button>
          </div>
        </Command>
      </Combobox.Content>
    </PopoverScoped>
  );
};
