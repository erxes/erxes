import { Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/tms/constants/languages';

interface TourFieldLanguageSwitchProps {
  availableLanguages: string[];
  value: string;
  onValueChange: (value: string) => void;
}

export const TourFieldLanguageSwitch = ({
  availableLanguages,
  value,
  onValueChange,
}: TourFieldLanguageSwitchProps) => {
  const { t } = useTranslation('tourism');
  if (!availableLanguages.length) {
    return null;
  }

  const selected = LANGUAGES.find((lang) => lang.value === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <Select.Trigger className="h-8 min-w-40">
        <Select.Value placeholder={t('select-language')} className="text-xs">
          {selected?.label || value}
        </Select.Value>
      </Select.Trigger>
      <Select.Content>
        {availableLanguages.map((langCode) => {
          const lang = LANGUAGES.find((item) => item.value === langCode);

          return (
            <Select.Item key={langCode} value={langCode}>
              {lang?.label || langCode}
            </Select.Item>
          );
        })}
      </Select.Content>
    </Select>
  );
};
