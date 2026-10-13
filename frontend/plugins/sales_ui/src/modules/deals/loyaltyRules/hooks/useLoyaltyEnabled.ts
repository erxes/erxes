import { useAtomValue } from 'jotai';
import { pluginsConfigState } from 'ui-modules';

// Read from the plugins loaded at runtime; a build-time env is not set on every deployment.
export const useLoyaltyEnabled = () => {
  const pluginsConfig = useAtomValue(pluginsConfigState);

  return Object.values(pluginsConfig || {}).some(
    (plugin) => plugin?.name === 'loyalty',
  );
};
