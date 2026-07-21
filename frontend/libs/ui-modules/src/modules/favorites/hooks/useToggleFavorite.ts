import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useLocation } from 'react-router-dom';
import { TOGGLE_FAVORITE } from '../graphql/mutations/toggleFavorite';
import { FavoriteToggleParams } from '../types';
import { useIsFavorite } from './useIsFavorite';

export const useToggleFavorite = ({
  path: providedPath,
  breadcrumb,
  icon,
}: FavoriteToggleParams) => {
  const { pathname, search } = useLocation();
  const path = providedPath || `${pathname}${search}`;

  const { isFavorite } = useIsFavorite({ path });

  const [toggleFavoriteMutation] = useMutation(TOGGLE_FAVORITE);

  const toggleFavorite = async () => {
    try {
      await toggleFavoriteMutation({
        variables: { path, breadcrumb, icon },
        refetchQueries: ['isFavorite', 'getFavoritesByCurrentUser'],
      });
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    }
  };

  return { isFavorite, toggleFavorite };
};
