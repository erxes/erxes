import { currencyOfCountry, type Organization } from '@erxes/core-contract';
import { IconDeviceFloppy, IconSettings } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Input,
  Label,
  PageContainer,
  PageHeader,
  ScrollArea,
  Spinner,
  useToast,
} from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { CountrySelect, CurrencySelect } from '~/components/RegionSelect';
import { messageOf, orpc } from '~/lib/api';
import { useCan, useSession } from '~/modules/auth/session';

/** Saves the organisation and gives the whole app its new name, country and currency. */
const useSaveOrganization = (onSaved: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'general' });
  const client = useQueryClient();
  const { toast } = useToast();

  return useMutation(
    orpc.organizations.update.mutationOptions({
      onSuccess: (organization) => {
        client.setQueryData(orpc.auth.me.queryKey(), (session) =>
          session ? { ...session, organization } : session,
        );
        void client.invalidateQueries({ queryKey: orpc.organizations.key() });
        onSaved();
        toast({ title: t('saved', 'Organisation saved') });
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('save-failed', 'Could not save'),
          description: messageOf(error),
        }),
    }),
  );
};

type Draft = Partial<Pick<Organization, 'name' | 'country' | 'currency'>>;

/** Country and currency; a new country brings its currency, which stays editable. */
const RegionFields = ({
  country,
  currency,
  disabled,
  onChange,
}: {
  country: string;
  currency: string;
  disabled: boolean;
  onChange: (region: { country?: string; currency: string }) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'general' });
  const id = useId();

  return (
    <div className="space-y-2">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${id}-country`}>{t('country', 'Country')}</Label>
          <CountrySelect
            id={`${id}-country`}
            value={country}
            disabled={disabled}
            onChange={(next) =>
              onChange({ country: next, currency: currencyOfCountry(next) ?? currency })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-currency`}>{t('currency', 'Currency')}</Label>
          <CurrencySelect
            id={`${id}-currency`}
            value={currency}
            disabled={disabled}
            onChange={(next) => onChange({ currency: next })}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {t(
          'currency-help',
          'New products and invoices take this currency. Products and invoices keep the currency they were made in.',
        )}
      </p>
    </div>
  );
};

/** The organisation's name and where it works; read-only without `settings.manage`. */
const OrganizationForm = ({
  organization,
  canEdit,
}: {
  organization: Organization;
  canEdit: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'general' });
  const id = useId();
  // Unsaved edits; the rest shows the saved organisation.
  const [draft, setDraft] = useState<Draft>({});
  const save = useSaveOrganization(() => setDraft({}));
  const name = draft.name ?? organization.name;
  const country = draft.country ?? organization.country ?? '';
  const currency = draft.currency ?? organization.currency;

  const changes = {
    name: name.trim() === organization.name ? undefined : name.trim(),
    country: country && country !== organization.country ? country : undefined,
    currency: currency === organization.currency ? undefined : currency,
  };

  const changed = Object.values(changes).some((value) => value !== undefined);

  return (
    <section className="space-y-5 rounded-lg border bg-background p-5">
      <div className="space-y-2">
        <Label htmlFor={`${id}-name`}>{t('name', 'Organisation name')}</Label>
        <Input
          id={`${id}-name`}
          value={name}
          maxLength={100}
          disabled={!canEdit}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
        {!name.trim() && (
          <p className="text-sm text-destructive">{t('name-required', 'Enter a name')}</p>
        )}
      </div>
      <RegionFields
        country={country}
        currency={currency}
        disabled={!canEdit}
        onChange={(region) => setDraft({ ...draft, ...region })}
      />
      {canEdit && (
        <Button
          disabled={!changed || !name.trim() || save.isPending}
          onClick={() => save.mutate(changes)}
        >
          {save.isPending ? <Spinner size="sm" /> : <IconDeviceFloppy />}
          {t('save', 'Save')}
        </Button>
      )}
    </section>
  );
};

/** Settings › General: the organisation itself. */
export const GeneralSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'general' });
  const { organization } = useSession();
  const canEdit = useCan()('settings.manage');

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[{ label: t('title', 'General'), to: '/settings/general', icon: IconSettings }]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-6">
          {!canEdit && (
            <p className="rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
              {t('read-only', 'Only owners and admins can change these settings.')}
            </p>
          )}
          <OrganizationForm organization={organization} canEdit={canEdit} />
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
