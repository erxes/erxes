import { useQueryState } from 'erxes-ui';

/** Links saved before the installed list got its own page still land there. */
export const useLegacyInstalledTab = () => {
  const [tab] = useQueryState<string>('tab');

  return { redirectTo: tab === 'installed' ? '/templates/installed' : null };
};
