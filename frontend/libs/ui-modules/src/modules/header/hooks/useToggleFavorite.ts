import { useIsFavorite } from './useIsFavorite';
import { useMutation } from '@apollo/client';
import { TOGGLE_FAVORITE } from '../graphql/mutations/toggleFavorite';
import { useLocation } from 'react-router-dom';

export const useToggleFavorite = () => {
  const { pathname, search } = useLocation();
  const path = `${pathname}${search}`;

  const { isFavorite } = useIsFavorite({ path });

  const [toggleFavoriteMutation] = useMutation(TOGGLE_FAVORITE);

  const toggleFavorite = () => {
    toggleFavoriteMutation({
      variables: { path },
      refetchQueries: ['isFavorite', 'getFavoritesByCurrentUser'],
    });
  };

  return { isFavorite, toggleFavorite };
};
