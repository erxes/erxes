import { useTranslation } from 'react-i18next';
import { SexCode } from 'erxes-ui/types/SexCode';

/** Each sex code's label in the UI's language. */
export const useSexLabels = (): Record<SexCode, string> => {
  const { t } = useTranslation('ui', { keyPrefix: 'sex' });

  return {
    [SexCode.NOT_KNOWN]: t('not-known', 'Not known'),
    [SexCode.MALE]: t('male', 'Male'),
    [SexCode.FEMALE]: t('female', 'Female'),
    [SexCode.NOT_APPLICABLE]: t('not-applicable', 'Not applicable'),
  };
};
