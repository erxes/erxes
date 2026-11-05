import { createContext, useContext, useRef, type ReactNode } from 'react';
import {
  EMPTY_REFERENCE_REGISTRY,
  type IAgentReferenceRegistry,
} from './referenceRegistry';

export const AgentReferenceScope = createContext<IAgentReferenceRegistry>(
  EMPTY_REFERENCE_REGISTRY,
);
export const useAgentReferenceRegistry = () => useContext(AgentReferenceScope);

/** Preserve context identity during text-only stream updates. */
export const AgentReferenceProvider = ({
  registry,
  children,
}: {
  registry: IAgentReferenceRegistry;
  children: ReactNode;
}) => {
  const stable = useRef(registry);
  if (stable.current.key !== registry.key) stable.current = registry;
  return (
    <AgentReferenceScope.Provider value={stable.current}>
      {children}
    </AgentReferenceScope.Provider>
  );
};
