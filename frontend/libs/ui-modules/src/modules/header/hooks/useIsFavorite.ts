import { useQuery } from '@apollo/client';
import { IS_FAVORITE } from '../graphql/queries/isFavorite';

export const useIsFavorite = ({ path }: { path: string }) => {
  const { data } = useQuery(IS_FAVORITE, {
    variables: { type: 'module', path },
  });

  return { isFavorite: data?.isFavorite };
};
