import { getPluginAssetsUrl } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TmsCreateSheet } from '~/modules/tms/components/CreateTmsSheet';

export const EmptyList = () => {
  const { t } = useTranslation('tourism');
  return (
    <div className="flex justify-center items-center min-h-[60vh] sm:h-screen px-3 sm:px-4">
      <div className="flex flex-col gap-3 justify-center items-center p-3 w-full max-w-sm rounded-lg shadow-lg sm:p-4 sm:max-w-md bg-background">
        <div className="overflow-hidden w-full aspect-video sm:h-52 sm:aspect-auto">
          <img
            src={getPluginAssetsUrl('tourism', 'tourism-empty-state.jpg')}
            alt="tourism"
            className="object-cover w-full h-full rounded"
          />
        </div>

        <div className="p-2 text-center">
          <h2 className="mb-2 text-lg font-semibold sm:mb-3 sm:text-xl text-foreground">
            {t('tour-management-system')}
          </h2>

          <p className="px-1 sm:px-0 text-center text-muted-foreground text-xs sm:text-sm font-medium leading-[140%] font-inter pb-3 sm:pb-4">
            {t('tms-empty-description')}
          </p>

          <TmsCreateSheet />
        </div>
      </div>
    </div>
  );
};
