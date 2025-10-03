import { useForm } from 'react-hook-form';
import { TGeneralSettingsProps } from '../types';
import { zodResolver } from '@hookform/resolvers/zod';
import { generalSettingsSchema } from '../schema';
import { AvailableLanguage, useSwitchLanguage } from '~/i18n';

const useGeneralSettingsForms = () => {
  const { currentLanguage, switchLanguage } = useSwitchLanguage();
  const methods = useForm<TGeneralSettingsProps>({
    mode: 'onBlur',
    defaultValues: {
      languageCode: currentLanguage,
      dealCurrency: [],
      CHECK_TEAM_MEMBER_SHOWN: false,
      BRANCHES_MASTER_TEAM_MEMBERS_IDS: [],
      DEPARTMENTS_MASTER_TEAM_MEMBERS_IDS: [],
    },
    resolver: zodResolver(generalSettingsSchema),
  });

  const handleLanguage = async (lng: string) => {
    await switchLanguage(lng as AvailableLanguage);
  };

  return {
    methods,
    handleLanguage,
  };
};

export { useGeneralSettingsForms };
