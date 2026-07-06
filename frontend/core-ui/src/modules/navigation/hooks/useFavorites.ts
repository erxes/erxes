import { useQuery } from '@apollo/client';
import { GET_FAVORITES } from '@/navigation/graphql/queries/getFavorites';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import {
  IconAddressBook,
  IconAffiliate,
  IconArrowsRightLeft,
  IconAward,
  IconBook,
  IconBooks,
  IconBox,
  IconBrandDatabricks,
  IconBroadcast,
  IconBriefcase,
  IconBuilding,
  IconCashBanknote,
  IconCashRegister,
  IconChartHistogram,
  IconChartPie,
  IconChecklist,
  IconClipboard,
  IconCoins,
  IconDirections,
  IconFile,
  IconInvoice,
  IconLibraryPhoto,
  IconListCheck,
  IconMail,
  IconMagnet,
  IconPhone,
  IconReceipt,
  IconSandbox,
  IconStackFront,
  IconStar,
  IconTicket,
  IconUser,
} from '@tabler/icons-react';
import { type ElementType } from 'react';

const FAVORITE_ICONS_BY_KEY: Record<string, ElementType> = {
  IconAddressBook,
  IconAffiliate,
  IconArrowsRightLeft,
  IconAward,
  IconBook,
  IconBooks,
  IconBox,
  IconBrandDatabricks,
  IconBroadcast,
  IconBriefcase,
  IconBuilding,
  IconCashBanknote,
  IconCashRegister,
  IconChartHistogram,
  IconChartPie,
  IconChecklist,
  IconClipboard,
  IconCoins,
  IconDirections,
  IconFile,
  IconInvoice,
  IconLibraryPhoto,
  IconListCheck,
  IconMail,
  IconMagnet,
  IconPhone,
  IconReceipt,
  IconSandbox,
  IconStackFront,
  IconStar,
  IconTicket,
  IconUser,
};

interface Favorite {
  _id: string;
  path: string;
  breadcrumb?: string[];
  icon?: string;
}

interface FavoriteModule {
  name: string;
  icon?: ElementType;
  path: string;
}

interface GetFavoritesResponse {
  getFavoritesByCurrentUser: Favorite[];
}

export function useFavorites(): FavoriteModule[] {
  const currentUser = useAtomValue(currentUserState);

  const { data } = useQuery<GetFavoritesResponse>(GET_FAVORITES, {
    skip: !currentUser?._id,
  });

  const favorites = data?.getFavoritesByCurrentUser ?? [];

  return favorites.map((favorite) => ({
    name: favorite.breadcrumb?.join(' / ') || favorite.path,
    icon: favorite.icon
      ? FAVORITE_ICONS_BY_KEY[favorite.icon] || IconStar
      : IconStar,
    path: favorite.path,
  }));
}
