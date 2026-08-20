import { useCallback, useMemo, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { pluginsConfigState } from 'ui-modules';
import { ISearchProvider } from 'erxes-ui';
import { validateSearchProviders } from '@/search/utils/composeSearchDocument';
import { CORE_SEARCH_PROVIDERS } from '@/search/providers/coreSearchProviders';
import { TSearchProviderCategory } from '@/search/types/GlobalSearch';

const MAX_QUARANTINE_RETRIES = 3;

const CORE_PROVIDER_CATEGORIES: Record<string, TSearchProviderCategory> = {
  'core-contacts': 'core-modules',
  'core-products': 'core-modules',
  settings: 'settings',
};

export type TSearchProviderWithCategory = ISearchProvider & {
  category: TSearchProviderCategory;
  subcategory: string;
  subcategoryLabel: string;
};

const resolveProviderCategory = (key: string): TSearchProviderCategory =>
  CORE_PROVIDER_CATEGORIES[key] ?? 'plugins';

export const useSearchProviders = () => {
  const pluginsConfig = useAtomValue(pluginsConfigState);
  const [quarantinedFields, setQuarantinedFields] = useState<Set<string>>(
    new Set(),
  );
  const retryCount = useRef(0);
  const quarantinedFieldsRef = useRef<Set<string>>(new Set());

  const providers = useMemo(() => {
    const pluginProviders = Object.values(pluginsConfig ?? {}).flatMap(
      (config) =>
        (Array.isArray(config?.searchProviders)
          ? config.searchProviders
          : []
        ).map((provider) => ({
          provider,
          subcategory: config.name,
          subcategoryLabel:
            config.name.charAt(0).toUpperCase() + config.name.slice(1),
        })),
    );

    const validated = validateSearchProviders([
      ...CORE_SEARCH_PROVIDERS,
      ...pluginProviders.map(({ provider }) => provider),
    ]);

    return validated
      .map((provider) => {
        const pluginProvider = pluginProviders.find(
          ({ provider: candidate }) => candidate.key === provider.key,
        );
        const category = resolveProviderCategory(provider.key);
        const coreSubcategory = provider.key.startsWith('core-')
          ? provider.key.slice('core-'.length)
          : provider.key;

        return {
          ...provider,
          category,
          subcategory: pluginProvider?.subcategory ?? coreSubcategory,
          subcategoryLabel:
            pluginProvider?.subcategoryLabel ??
            coreSubcategory.charAt(0).toUpperCase() + coreSubcategory.slice(1),
          selections: provider.selections.filter(
            (selection) => !quarantinedFields.has(selection.field),
          ),
        };
      })
      .filter((provider) => provider.selections.length > 0)
      .sort(
        (a, b) =>
          (a.order ?? 1000) - (b.order ?? 1000) || a.key.localeCompare(b.key),
      );
  }, [pluginsConfig, quarantinedFields]);

  const quarantineFields = useCallback((fields: string[]) => {
    if (fields.length === 0 || retryCount.current >= MAX_QUARANTINE_RETRIES) {
      return;
    }

    const next = new Set(quarantinedFieldsRef.current);

    for (const field of fields) {
      next.add(field);
    }

    if (next.size === quarantinedFieldsRef.current.size) {
      return;
    }

    quarantinedFieldsRef.current = next;
    retryCount.current += 1;
    setQuarantinedFields(next);
  }, []);

  return {
    providers,
    quarantineFields,
    canQuarantineFields: retryCount.current < MAX_QUARANTINE_RETRIES,
  };
};
