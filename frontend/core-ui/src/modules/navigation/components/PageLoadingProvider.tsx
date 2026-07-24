import {
  updatePageLoadingSourceState,
} from '@/navigation/states/pageLoadingState';
import { normalizeVisitedPagePathname } from '@/navigation/utils/visitedPageTabs';
import { LoadingIndicatorProvider } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { PropsWithChildren, useCallback, useId } from 'react';
import { useLocation } from 'react-router-dom';

export const PageLoadingProvider = ({ children }: PropsWithChildren) => {
  const providerId = useId();
  const { pathname } = useLocation();
  const normalizedPathname = normalizeVisitedPagePathname(pathname);
  const updatePageLoadingSource = useSetAtom(updatePageLoadingSourceState);

  const handleLoadingChange = useCallback(
    (sourceId: string, isLoading: boolean) => {
      updatePageLoadingSource({
        isLoading,
        pathname: normalizedPathname,
        sourceId: `${providerId}:${sourceId}`,
      });
    },
    [normalizedPathname, providerId, updatePageLoadingSource],
  );

  return (
    <LoadingIndicatorProvider onLoadingChange={handleLoadingChange}>
      {children}
    </LoadingIndicatorProvider>
  );
};
