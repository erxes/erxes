import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useId,
} from 'react';

type LoadingIndicatorChangeHandler = (
  sourceId: string,
  isLoading: boolean,
) => void;

const LoadingIndicatorContext =
  createContext<LoadingIndicatorChangeHandler | null>(null);

// skipcq: JS-D1001 - Covered by repository documentation policy.
export const LoadingIndicatorProvider = ({
  children,
  onLoadingChange,
}: PropsWithChildren<{
  onLoadingChange: LoadingIndicatorChangeHandler;
}>) => (
  <LoadingIndicatorContext.Provider value={onLoadingChange}>
    {children}
  </LoadingIndicatorContext.Provider>
);

// skipcq: JS-D1001 - Covered by repository documentation policy.
export const useLoadingIndicator = (isLoading = true) => {
  const loadingSourceId = useId();
  const onLoadingChange = useContext(LoadingIndicatorContext);

  useEffect(() => {
    if (!onLoadingChange || !isLoading) {
      return;
    }

    onLoadingChange(loadingSourceId, true);

    /* skipcq: JS-0045 - React effects return cleanup callbacks. */
    return () => {
      onLoadingChange(loadingSourceId, false);
    };
  }, [isLoading, loadingSourceId, onLoadingChange]);
};
