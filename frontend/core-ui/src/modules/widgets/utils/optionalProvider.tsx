import { ComponentType, ReactNode } from 'react';

type TProvider<P> = ComponentType<P & { children: ReactNode }>;

const Passthrough = ({ children }: { children: ReactNode }) => <>{children}</>;

/**
 * `ui-modules` is a shared singleton, and a remote built against an older copy
 * can be the one served. A provider that copy lacks then turns its feature
 * off instead of taking the whole app down.
 */
export const optionalProvider = <P,>(
  Provider: TProvider<P> | undefined,
): TProvider<P> => Provider ?? (Passthrough as TProvider<P>);
