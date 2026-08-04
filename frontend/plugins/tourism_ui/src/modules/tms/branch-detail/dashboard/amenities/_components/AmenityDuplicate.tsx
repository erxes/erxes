import { useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCreateAmenity } from '../hooks/useCreateAmenity';
import { IAmenity } from '../types/amenity';

interface AmenityDuplicateProps {
  amenity: IAmenity;
  branchId?: string;
  children: (props: {
    onClick: () => void;
    disabled: boolean;
  }) => React.ReactNode;
}

export const AmenityDuplicate = ({
  amenity,
  branchId,
  children,
}: AmenityDuplicateProps) => {
  const { t } = useTranslation('tourism');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { createAmenity, loading } = useCreateAmenity();

  const duplicateSuffix = ' (copy)';

  const handleDuplicate = () => {
    const primaryLanguage = amenity.language;
    const primaryTranslation = amenity.translations?.find(
      (translation) => translation.language === primaryLanguage,
    );
    const primaryName = primaryTranslation?.name || amenity.name || '';
    const translations = amenity.translations
      ?.filter((translation) => translation.language !== primaryLanguage)
      .map((translation) => ({
        language: translation.language,
        name: translation.name
          ? `${translation.name}${duplicateSuffix}`
          : undefined,
      }))
      .filter((translation) => translation.name);

    confirm({
      message: t('confirm-duplicate-amenity'),
      options: { confirmationValue: 'duplicate' },
    })
      .then(() => {
        createAmenity({
          variables: {
            branchId: branchId || amenity.branchId,
            name: `${primaryName}${duplicateSuffix}`,
            icon: amenity.icon,
            quick: amenity.quick,
            language: primaryLanguage,
            translations: translations?.length ? translations : undefined,
          },
          onCompleted: () => {
            toast({
              title: t('success'),
              variant: 'success',
              description: t('amenity-duplicated-successfully'),
            });
          },
          onError: (e: unknown) => {
            toast({
              title: t('error'),
              description:
                e instanceof Error ? e.message : t('unknown-error-occurred'),
              variant: 'destructive',
            });
          },
        });
      })
      .catch((e: unknown) => {
        if (e instanceof Error) {
          toast({
            title: t('error'),
            description: e.message,
            variant: 'destructive',
          });
        }
      });
  };

  return <>{children({ onClick: handleDuplicate, disabled: loading })}</>;
};
