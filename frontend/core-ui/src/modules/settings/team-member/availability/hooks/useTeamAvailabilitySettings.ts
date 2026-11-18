import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  TEAM_AVAILABILITY_SETTINGS,
  TEAM_AVAILABILITY_SETTINGS_UPDATE,
} from '../graphql/availability';
import { ITeamAvailabilitySettings } from '../types';

export const useTeamAvailabilitySettings = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { data, loading } = useQuery<{
    teamAvailabilitySettings: ITeamAvailabilitySettings;
  }>(TEAM_AVAILABILITY_SETTINGS);
  const [mutate, { loading: saving }] = useMutation(
    TEAM_AVAILABILITY_SETTINGS_UPDATE,
    // Every member's availability may change with the linked segment.
    { refetchQueries: [TEAM_AVAILABILITY_SETTINGS, 'Users'] },
  );

  const save = (settings: ITeamAvailabilitySettings, onDone?: () => void) =>
    mutate({
      variables: settings,
      onCompleted: () => {
        toast({
          title: t('availability-settings-saved', 'Availability settings saved'),
        });
        onDone?.();
      },
      onError: (error) =>
        toast({ title: error.message, variant: 'destructive' }),
    });

  return {
    settings: data?.teamAvailabilitySettings,
    loading,
    save,
    saving,
  };
};
