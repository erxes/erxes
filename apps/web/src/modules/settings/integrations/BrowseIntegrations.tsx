import { Spinner, ToggleGroup } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { NoMatches } from '~/components/NoMatches';
import { paths } from '~/lib/paths';
import { countryNames } from '~/lib/region';
import { useSession } from '~/modules/auth/session';
import {
  CATEGORIES,
  categoriesOf,
  type Category,
  type Integration,
  servesCountry,
  useIntegrations,
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
      payments: t('payments', 'Payment gateways'),
      banks: t('banks', 'Banks'),
      sign_in: t('sign_in', 'Customer sign-in'),
      social: t('social', 'Social media'),
      messaging: t('messaging', 'Messaging'),
      email: t('email', 'Mail service'),
      government: t('government', 'Government'),
      developer: t('developer', 'Developer tools'),
      productivity: t('productivity', 'Productivity'),
      ai: t('ai', 'AI Provider'),
      decision: t('decision', 'Decision model'),
    })[category];
};

const IntegrationTile = ({
  integration,
  foreign,
}: {
  integration: Integration;
  /** Not set up and made for other countries: say where it works. */
  foreign: boolean;
}) => {
  const { t, i18n } = useTranslation('settings', { keyPrefix: 'integrations' });
  const { name, summary } = useIntegrationText()(integration);
  const { status } = integration;

  return (
    <li>
      <Link
        to={paths.settings.integration(integration.slug)}
        className="flex h-full flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <span className="flex items-start gap-3">
          <IntegrationMark integration={integration} />
          <span className="min-w-0 flex-1 font-medium">{name}</span>
          {/* Only what is connected carries a state; the rest are simply available. */}
          <IntegrationStatusBadge status={status.state === 'not-set-up' ? null : status} />
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

const Section = ({ title, items }: { title: string; items: Placed[] }) => {
  const id = useId();

  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="text-sm font-medium text-muted-foreground">
        {title}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ integration, rank }) => (
          <IntegrationTile
            key={integration.slug}
            integration={integration}
            foreign={rank === 'elsewhere'}
          />
        ))}
      </ul>
    </section>
  );
};

const CategoryFilter = ({
  category,
  categories,
  onChange,
}: {
  category: Category | null;
  /** The categories with at least one listed integration. */
  categories: Category[];
  onChange: (category: Category | null) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const categoryLabel = useCategoryLabel();

  return (
    <ToggleGroup
      variant="outline"
      size="sm"
      className="w-fit max-w-full flex-wrap justify-start"
      aria-label={t('categories', 'Categories')}
      value={[category ?? 'all']}
      onValueChange={([next]) => onChange(categories.find((item) => item === next) ?? null)}
    >
      <ToggleGroup.Item value="all">{t('all', 'All')}</ToggleGroup.Item>
      {categories.map((item) => (
        <ToggleGroup.Item key={item} value={item}>
          {categoryLabel(item)}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
};

/** Where a tile goes in its category: connected, then local, then made for other regions. */
const RANKS = ['connected', 'local', 'elsewhere'] as const;

type Placed = { integration: Integration; rank: (typeof RANKS)[number] };

/**
 * The catalog cut by the search and category, one section per category with an integration
 * in it, in the categories' order. A category no integration is in is no filter.
 */
export const useSections = (search: string, chosen: Category | null) => {
  const { country } = useSession().organization;
  const categoryLabel = useCategoryLabel();
  const textOf = useIntegrationText();
  const { integrations, listed } = useIntegrations();
  const needle = search.trim().toLocaleLowerCase();

  const categories = CATEGORIES.filter((item) =>
    integrations.some((integration) => categoriesOf(integration).includes(item)),
  );

  const category = categories.find((item) => item === chosen) ?? null;

  const matches = (integration: Integration) => {
    const { name, summary } = textOf(integration);

    return [name, summary, ...categoriesOf(integration).map(categoryLabel)].some((text) =>
      text.toLocaleLowerCase().includes(needle),
    );
  };

  const rankOf = (integration: Integration): Placed['rank'] => {
    if (integration.status.state !== 'not-set-up') return 'connected';

    return !country || servesCountry(integration, country) ? 'local' : 'elsewhere';
  };

  const shown = integrations
    .filter(
      (integration) =>
        (!category || categoriesOf(integration).includes(category)) && matches(integration),
    )
    .map((integration): Placed => ({ integration, rank: rankOf(integration) }))
    .toSorted((a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank));

  return {
    listed,
    total: integrations.length,
    categories,
    category,
    shown,
    sections: categories.flatMap((item) => {
      if (category && item !== category) return [];

      const items = shown.filter(({ integration }) => categoriesOf(integration).includes(item));

      return items.length ? [{ category: item, title: categoryLabel(item), items }] : [];
    }),
  };
};

export const BrowseIntegrations = ({
  sections,
  onCategory,
}: {
  sections: ReturnType<typeof useSections>;
  onCategory: (category: Category | null) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });

  return (
    <div className="space-y-6">
      <CategoryFilter
        category={sections.category}
        categories={sections.categories}
        onChange={onCategory}
      />
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
        sections.sections.map((section) => (
          <Section key={section.category} title={section.title} items={section.items} />
        ))
      )}
    </div>
  );
};
