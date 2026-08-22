import { useMemo } from 'react';
import { ISearchProvider } from 'erxes-ui';
import { buildGlobalSearchDocument } from '@/search/utils/composeSearchDocument';

export const useGlobalSearchDocument = (
  providers: ISearchProvider[],
  overrides: Record<string, string> = {},
) =>
  useMemo(() => buildGlobalSearchDocument(providers, overrides), [
    providers,
    overrides,
  ]);
