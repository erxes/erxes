import { IconLock } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const NoAccessPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'no-access' });
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
          <IconLock className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">{t('title')}</h2>
        <p className="text-gray-500">{t('description')}</p>
      </div>
    </div>
  );
};
