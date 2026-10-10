import { GET_FAVORITES } from '@/navigation/graphql/queries/getFavorites';
import { TOGGLE_FAVORITE } from 'ui-modules/modules/favorites/graphql/mutations/toggleFavorite';
import { currentUserState } from 'ui-modules';
import { toast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useMutation, useQuery } from '@apollo/client';

interface IFavoritesResponse {
  getFavoritesByCurrentUser: { path: string }[];
}

const normalizePath = (path: string) =>
  path
    .split(/[?#]/)[0]
    .replace('_ui', '')
    .replace(/^\/+|\/+$/g, '');

export const useNavigationFavorite = ({
  breadcrumb,
  path,
}: {
  breadcrumb: string[];
  path: string;
}) => {
  const currentUser = useAtomValue(currentUserState);
  const { data } = useQuery<IFavoritesResponse>(GET_FAVORITES, {
    skip: !currentUser?._id,
  });
  const [toggleMutation] = useMutation(TOGGLE_FAVORITE, {
    refetchQueries: ['getFavoritesByCurrentUser'],
    onError: (error) => toast({ title: error.message, variant: 'destructive' }),
  });
  const target = normalizePath(path);
  const isFavorite = Boolean(
    data?.getFavoritesByCurrentUser.some(
      (favorite) => normalizePath(favorite.path) === target,
    ),
  );

  return {
    isFavorite,
    toggleFavorite: () => toggleMutation({ variables: { path, breadcrumb } }),
  };
};
