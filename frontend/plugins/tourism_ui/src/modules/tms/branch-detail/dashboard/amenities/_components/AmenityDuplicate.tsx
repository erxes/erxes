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

  const handleDuplicate = () => {
    confirm({
      message: 'Are you sure you want to duplicate this amenity?',
      options: { confirmationValue: 'duplicate' },
    }).then(() => {
      createAmenity({
        variables: {
          branchId: branchId || amenity.branchId,
          name: `${amenity.name || ''} (copy)`,
          icon: amenity.icon,
          quick: amenity.quick,
        },
        onCompleted: () => {
          toast({
            title: 'Success',
            variant: 'success',
            description: 'Amenity duplicated successfully',
          });
        },
        onError: (e: any) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    });
  };

  return <>{children({ onClick: handleDuplicate, disabled: loading })}</>;
};
