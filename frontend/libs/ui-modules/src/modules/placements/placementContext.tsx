import { createContext, useContext } from 'react';

/**
 * Wraps one extension component where it's placed. core-ui provides it:
 * Suspense while the component loads, an error boundary if it breaks.
 */
export type PlacementBoundary = (props: {
  pluginName: string;
  children: React.ReactNode;
}) => JSX.Element | null;

const PlacementContext = createContext<{ Boundary: PlacementBoundary }>({
  Boundary: () => null,
});

export const PlacementProvider = ({
  children,
  Boundary,
}: {
  children: React.ReactNode;
  Boundary: PlacementBoundary;
}) => (
  <PlacementContext.Provider value={{ Boundary }}>
    {children}
  </PlacementContext.Provider>
);

export const usePlacementContext = () => useContext(PlacementContext);
