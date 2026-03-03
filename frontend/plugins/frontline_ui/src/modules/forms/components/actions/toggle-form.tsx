import { GET_FORMS_LIST } from '@/forms/graphql/formQueries';
import { useFormToggleStatus } from '@/forms/hooks/useFormToggleStatus';
import { IconSquareToggle } from '@tabler/icons-react';
import { DropdownMenu, toast } from 'erxes-ui';

type Props = {
  formId: string;
  status: string;
  setOpen: (open: boolean) => void;
};

export function FormToggleStatus({ formId, status, setOpen }: Props) {
  const { toggleStatus, loading } = useFormToggleStatus();

  const onSelect = () => {
    toggleStatus({
      variables: {
        ids: [formId],
      },
      refetchQueries: [GET_FORMS_LIST],
      onCompleted: () => {
        setOpen(false);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          variant: 'destructive',
          description: error.message,
        });
      },
    });
  };

  return (
    <DropdownMenu.Item onSelect={onSelect}>
      <IconSquareToggle />
      {status === 'active' ? 'Archive' : 'Unarchive'}
    </DropdownMenu.Item>
  );
}
