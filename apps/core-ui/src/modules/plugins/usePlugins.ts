import { useQuery } from '@tanstack/react-query';
import { loadPlugins } from './remotes';

/** Plugin UIs available to the signed-in member (loaded once per session). */
export const usePlugins = () => {
  const query = useQuery({
    queryKey: ['plugins'],
    queryFn: () => loadPlugins(),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });

  return { plugins: query.data ?? [], loading: query.isPending };
};
