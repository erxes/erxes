import { useEffect, useState } from 'react';

/**
 * Returns true only after the component has mounted on the client.
 *
 * SSR guard: Recharts accesses window/document at render time and will throw
 * during server-side rendering or static generation. Wrap Recharts trees in
 * a check of this hook before rendering them.
 */
export function useIsClient(): boolean {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return isClient;
}
