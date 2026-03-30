import { useConfirm, useToast } from 'erxes-ui';
import { useCreateElement } from '../hooks/useCreateElement';
import { IElement } from '../types/element';

interface ElementDuplicateProps {
  element: IElement;
  branchId?: string;
  children: (props: { onClick: () => void; disabled: boolean }) => React.ReactNode;
}

export const ElementDuplicate = ({
  element,
  branchId,
  children,
}: ElementDuplicateProps) => {
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { createElement, loading } = useCreateElement();

  const handleDuplicate = () => {
    confirm({
      message: 'Are you sure you want to duplicate this element?',
      options: { confirmationValue: 'duplicate' },
    }).then(() => {
      createElement({
        variables: {
          branchId: branchId || element.branchId,
          name: `${element.name || ''} (copy)`,
          note: element.note,
          startTime: element.startTime,
          duration: element.duration,
          cost: element.cost,
          categories: element.categories,
          quick: element.quick,
        },
        onCompleted: () => {
          toast({
            title: 'Success',
            variant: 'success',
            description: 'Element duplicated successfully',
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
