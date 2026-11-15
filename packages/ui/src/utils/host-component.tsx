import { type ComponentType, Suspense, useSyncExternalStore } from 'react';

/**
 * A component the host app (web) provides at startup and plugin UIs render: core's timeline,
 * a record's own page, a list's filter. erxes-ui is a Module Federation singleton, so every
 * plugin gets the host's. Outside erxes nothing is registered and it renders nothing.
 */
export const hostComponent = <P extends object>() => {
  let registered: ComponentType<P> | null = null;
  const listeners = new Set<() => void>();

  const subscribe = (listener: () => void) => {
    listeners.add(listener);

    return () => listeners.delete(listener);
  };

  const read = () => registered;

  const set = (component: ComponentType<P> | null) => {
    registered = component;
    listeners.forEach((listener) => listener());
  };

  const Host = (props: P) => {
    const Component = useSyncExternalStore(subscribe, read, read);

    if (!Component) return null;

    // The host may load it on first use; the rest of the page doesn't wait for it.
    return (
      <Suspense fallback={null}>
        <Component {...props} />
      </Suspense>
    );
  };

  return { set, Host };
};
