import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';

export const ReportFooter = () => {
  const { t } = useTranslation('accounting');

  const currentUser = useAtomValue(currentUserState);

  return (
    <div className="py-8 flex flex-col gap-4 pl-[30%]">
      <div>
        {t('prepared-by')}
        {currentUser?.details?.fullName || currentUser?.email || ''}/
      </div>
      <div>{t('reviewed-by')}</div>
    </div>
  );
};
