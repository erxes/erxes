import { useConfirm, useToast } from 'erxes-ui';
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
      message: 'Are you sure you want to duplicate this amenity?',
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
              title: 'Success',
              variant: 'success',
              description: 'Amenity duplicated successfully',
            });
          },
          onError: (e: unknown) => {
            toast({
              title: 'Error',
              description:
                e instanceof Error ? e.message : 'Something went wrong',
              variant: 'destructive',
            });
          },
        });
      })
      .catch((e: unknown) => {
        if (e instanceof Error) {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        }
      });
  };

  return <>{children({ onClick: handleDuplicate, disabled: loading })}</>;
};
