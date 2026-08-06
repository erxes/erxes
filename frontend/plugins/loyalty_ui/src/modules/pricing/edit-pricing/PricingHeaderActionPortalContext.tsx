import { createContext, useContext, type ReactNode } from 'react';

const PricingHeaderActionPortalContext = createContext<HTMLElement | null>(
  null,
);

interface PricingHeaderActionPortalProviderProps {
  children: ReactNode;
  target: HTMLElement | null;
}

export const PricingHeaderActionPortalProvider = ({
  children,
  target,
}: PricingHeaderActionPortalProviderProps) => (
  <PricingHeaderActionPortalContext.Provider value={target}>
    {children}
  </PricingHeaderActionPortalContext.Provider>
);

export const usePricingHeaderActionPortal = () =>
  useContext(PricingHeaderActionPortalContext);
