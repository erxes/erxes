import {
  createFavoriteBreadcrumb,
  type FavoriteBreadcrumbSegment,
} from 'ui-modules';
import { useTranslation } from 'react-i18next';

import { useGetTeam } from '@/team/hooks/useGetTeam';

const UNKNOWN_BREADCRUMB_SEGMENT = 'Unknown';

export const useTeamFavoriteBreadcrumb = (
  teamId: string | undefined,
  ...segments: FavoriteBreadcrumbSegment[]
) => {
  const { t } = useTranslation('operation');
  const { team, loading } = useGetTeam({
    variables: { _id: teamId },
    skip: !teamId,
  });

  const teamSegment = teamId
    ? team?.name || UNKNOWN_BREADCRUMB_SEGMENT
    : undefined;

  return {
    breadcrumb: createFavoriteBreadcrumb(
      t('operation'),
      teamSegment,
      ...segments,
    ),
    loading: !!teamId && loading,
  };
};
