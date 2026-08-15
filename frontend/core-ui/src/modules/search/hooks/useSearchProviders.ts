import { useCallback, useMemo, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { pluginsConfigState } from 'ui-modules';
import { ISearchProvider } from 'erxes-ui';
import { validateSearchProviders } from '@/search/utils/composeSearchDocument';
import { CORE_SEARCH_PROVIDERS } from '@/search/providers/coreSearchProviders';

const MAX_QUARANTINE_RETRIES = 3;

export const useSearchProviders = () => {
  const pluginsConfig = useAtomValue(pluginsConfigState);
  const [quarantinedFields, setQuarantinedFields] = useState<Set<string>>(
    new Set(),
  );
  const retryCount = useRef(0);

  const providers = useMemo(() => {
    const fromPlugins = Object.values(pluginsConfig ?? {}).flatMap(
      (config): ISearchProvider[] =>
        Array.isArray(config?.searchProviders) ? config.searchProviders : [],
    );

    const validated = validateSearchProviders([
      ...CORE_SEARCH_PROVIDERS,
      ...fromPlugins,
    ]);

    return validated
      .map((provider) => ({
        ...provider,
        selections: provider.selections.filter(
          (selection) => !quarantinedFields.has(selection.field),
        ),
      }))
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

    setQuarantinedFields((prev) => {
      const next = new Set(prev);

      for (const field of fields) {
        next.add(field);
      }

      if (next.size === prev.size) {
        return prev;
      }

      retryCount.current += 1;

      return next;
    });
  }, []);

  return {
    providers,
    quarantineFields,
    canQuarantineFields: retryCount.current < MAX_QUARANTINE_RETRIES,
  };
};
