import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AvailableLanguage, useSwitchLanguage } from '~/i18n';
import { generalSettingsSchema } from '../schema';
import { TGeneralSettingsProps } from '../types';

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
      // Left blank rather than guessed from the browser: prefilling the
      // viewer's own zone made an organization that has never set one look
      // configured, while the server kept deciding every day boundary in UTC.
      TIMEZONE: '',
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
