import { useIsFavorite } from './useIsFavorite';
import { useMutation } from '@apollo/client';
import { TOGGLE_FAVORITE } from '../graphql/mutations/toggleFavorite';
import { useLocation } from 'react-router-dom';

export const useToggleFavorite = () => {
  const { pathname } = useLocation();

  const { isFavorite } = useIsFavorite({ path: pathname });

  const [toggleFavoriteMutation] = useMutation(TOGGLE_FAVORITE);

  const toggleFavorite = () => {
    toggleFavoriteMutation({
      variables: { type: 'module', path: pathname },
      refetchQueries: ['isFavorite', 'getFavoritesByCurrentUser'],
    });
  };

  return { isFavorite, toggleFavorite };
};
