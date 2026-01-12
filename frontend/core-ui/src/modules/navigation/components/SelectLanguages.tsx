import { IconChevronRight, IconLanguage } from '@tabler/icons-react';
import { DropdownMenu } from 'erxes-ui';
import { INTL_LANGUAGES } from 'erxes-ui/constants/IntlLanguages';
import { AvailableLanguage, useSwitchLanguage } from '~/i18n';
import { useTranslation } from 'react-i18next';

export const SelectLanguages = () => {
  const { currentLanguage, languages, switchLanguage } = useSwitchLanguage();

  const getLanguageName = (language: AvailableLanguage) => {
    return (
      Object.entries(INTL_LANGUAGES).find(([_, code]) =>
        code.includes(language + '-'),
      )?.[0] || language
    );
  };
  const { t } = useTranslation('organization');

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        {t('change-language')}
        <IconChevronRight className="ml-auto" />
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent className="min-w-56" sideOffset={8}>
          <DropdownMenu.RadioGroup
            value={currentLanguage}
            onValueChange={(value) =>
              switchLanguage(value as AvailableLanguage)
            }
          >
            {languages.map((language) => (
              <DropdownMenu.RadioItem key={language} value={language}>
                {getLanguageName(language)}
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  );
};
