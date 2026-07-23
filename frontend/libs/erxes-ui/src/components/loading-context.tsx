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

export const useLoadingIndicator = (isLoading = true) => {
  const loadingSourceId = useId();
  const onLoadingChange = useContext(LoadingIndicatorContext);

  useEffect(() => {
    if (!onLoadingChange || !isLoading) {
      return;
    }

    onLoadingChange(loadingSourceId, true);

    return () => onLoadingChange(loadingSourceId, false);
  }, [isLoading, loadingSourceId, onLoadingChange]);
};
