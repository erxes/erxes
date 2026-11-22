import { IconPlugConnected, IconSearch } from '@tabler/icons-react';
import { messageOf } from '@erxes/core-contract/client';
import {
  Button,
  InputGroup,
  PageContainer,
  PageHeader,
  ScrollArea,
  Spinner,
  ToggleGroup,
} from 'erxes-ui';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { NoMatches } from '~/components/NoMatches';
import { Link, Navigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { paths } from '~/lib/paths';
import { countryNames } from '~/lib/region';
import { useSession } from '~/modules/auth/session';
import {
  CATEGORIES,
  type Category,
  type Integration,
  servesCountry,
  statusOf,
  useIntegrations,
  useMayOpenIntegrations,
} from './catalog';
import {
  IntegrationMark,
  IntegrationStatusBadge,
  useIntegrationText,
} from './IntegrationStatusBadge';

const useCategoryLabel = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.category' });

  return (category: Category) =>
    ({
      email: t('email', 'Email'),
      messaging: t('messaging', 'Messaging'),
      payments: t('payments', 'Payments'),
      banks: t('banks', 'Banks'),
      tax: t('tax', 'Tax receipts'),
      sales: t('sales', 'Sales'),
      marketing: t('marketing', 'Marketing'),
      developer: t('developer', 'Developer tools'),
      productivity: t('productivity', 'Productivity'),
      social: t('social', 'Social'),
    })[category];
};

const IntegrationTile = ({
  integration,
  foreign,
}: {
  integration: Integration;
  /** Listed under other regions: say where it works. */
  foreign: boolean;
}) => {
  const { t, i18n } = useTranslation('settings', { keyPrefix: 'integrations' });
  const categoryLabel = useCategoryLabel();
  const { name, summary } = useIntegrationText()(integration);
  const status = statusOf(integration);

  return (
    <li>
      <Link
        to={paths.settings.integration(integration.key)}
        className="flex h-full flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <span className="flex items-start gap-3">
          <IntegrationMark integration={integration} />
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{name}</span>
            <span className="block text-xs text-muted-foreground">
              {categoryLabel(integration.category)}
            </span>
          </span>
          {/* Only what is connected carries a state; the rest are simply available. */}
          <IntegrationStatusBadge status={status?.state === 'not-set-up' ? null : status} />
        </span>
        <span className="line-clamp-2 text-sm text-muted-foreground">{summary}</span>
        {foreign && (
          <span className="mt-auto text-xs text-muted-foreground">
            {t('made-for', 'Made for {{countries}}', {
              countries: countryNames([...integration.countries], i18n.language),
            })}
          </span>
        )}
      </Link>
    </li>
  );
};

const Section = ({
  title,
  items,
  foreign = false,
}: {
  title: string;
  items: Integration[];
  foreign?: boolean;
}) => {
  const id = useId();

  if (!items.length) return null;

  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="text-sm font-medium text-muted-foreground">
        {title}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((integration) => (
          <IntegrationTile key={integration.key} integration={integration} foreign={foreign} />
        ))}
      </ul>
    </section>
  );
};

const Filters = ({
  search,
  category,
  onChange,
}: {
  search: string;
  category: Category | null;
  onChange: (next: { q?: string | null; category?: Category | null }) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const categoryLabel = useCategoryLabel();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <InputGroup className="h-8 w-full sm:w-64">
        <InputGroup.Addon>
          <IconSearch className="pointer-events-none size-3.5" />
        </InputGroup.Addon>
        <InputGroup.Input
          type="search"
          placeholder={t('search', 'Search integrations…')}
          aria-label={t('search', 'Search integrations…')}
          value={search}
          onChange={(event) => onChange({ q: event.target.value || null })}
        />
      </InputGroup>
      <ToggleGroup
        variant="outline"
        size="sm"
        aria-label={t('categories', 'Categories')}
        value={[category ?? 'all']}
        onValueChange={([next]) =>
          onChange({ category: CATEGORIES.find((item) => item === next) ?? null })
        }
      >
        <ToggleGroup.Item value="all">{t('all', 'All')}</ToggleGroup.Item>
        {CATEGORIES.map((item) => (
          <ToggleGroup.Item key={item} value={item}>
            {categoryLabel(item)}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup>
    </div>
  );
};

const isSetUp = (integration: Integration) =>
  (statusOf(integration)?.state ?? 'not-set-up') !== 'not-set-up';

/** The catalog cut by the search and category, then into connected, local and other regions. */
const useSections = (search: string, category: Category | null) => {
  const { country } = useSession().organization;
  const categoryLabel = useCategoryLabel();
  const textOf = useIntegrationText();
  const { integrations, listed } = useIntegrations();
  const needle = search.trim().toLocaleLowerCase();

  const matches = (integration: Integration) => {
    const { name, summary } = textOf(integration);

    return [name, summary, categoryLabel(integration.category)].some((text) =>
      text.toLocaleLowerCase().includes(needle),
    );
  };

  const shown = integrations.filter(
    (integration) => (!category || integration.category === category) && matches(integration),
  );

  const local = (integration: Integration) => !country || servesCountry(integration, country);

  return {
    listed,
    shown,
    connected: shown.filter(isSetUp),
    available: shown.filter((integration) => !isSetUp(integration) && local(integration)),
    elsewhere: shown.filter((integration) => !isSetUp(integration) && !local(integration)),
  };
};

const Catalog = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });

  const [params, setParams] = useQueryStates({
    q: parseAsString,
    category: parseAsStringLiteral(CATEGORIES),
  });

  const search = params.q ?? '';
  const sections = useSections(search, params.category);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">{t('title', 'Integrations')}</h1>
        <p className="text-sm text-muted-foreground">
          {t(
            'intro',
            'Connect the services your organisation works with. Each one runs for all your plugins.',
          )}
        </p>
      </div>
      <Filters
        search={search}
        category={params.category}
        onChange={(next) => void setParams(next)}
      />
      {sections.listed.isError && (
        <div role="alert" className="flex items-center gap-3 rounded-lg border p-3 text-sm">
          <span className="flex-1 text-destructive-text">
            {t('load-failed', 'Could not load the integrations: {{message}}', {
              message: messageOf(sections.listed.error),
            })}
          </span>
          <Button variant="outline" size="sm" onClick={() => void sections.listed.refetch()}>
            {t('retry', 'Retry')}
          </Button>
        </div>
      )}
      {sections.listed.isPending ? (
        <div className="flex justify-center p-6">
          <Spinner />
        </div>
      ) : sections.shown.length === 0 ? (
        <NoMatches
          title={t('no-match', 'No integrations match')}
          description={t('no-match-description', 'Try another word or category.')}
        />
      ) : (
        <>
          <Section title={t('section.connected', 'Connected')} items={sections.connected} />
          <Section title={t('section.available', 'Available')} items={sections.available} />
          <Section
            title={t('section.elsewhere', 'Other regions')}
            items={sections.elsewhere}
            foreign
          />
        </>
      )}
    </div>
  );
};

/** Settings › Integrations: the outside services core connects to, as a searchable catalog. */
export const IntegrationsSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });

  if (!useMayOpenIntegrations()) return <Navigate to={paths.settings.root} replace />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              {
                label: t('title', 'Integrations'),
                to: paths.settings.integrations,
                icon: IconPlugConnected,
              },
            ]}
          />
        </PageHeader.Start>
      </PageHeader>
      <ScrollArea className="flex-1">
        <Catalog />
      </ScrollArea>
    </PageContainer>
  );
};
