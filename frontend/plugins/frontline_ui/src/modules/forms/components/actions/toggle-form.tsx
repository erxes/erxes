import {
  GET_FORMS_LIST,
  GET_FORMS_TOTAL_COUNT,
} from '@/forms/graphql/formQueries';
import { useFormToggleStatus } from '@/forms/hooks/useFormToggleStatus';
import { IconSquareToggle } from '@tabler/icons-react';
import { DropdownMenu, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type Props = {
  formId: string;
  status: string;
  setOpen: (open: boolean) => void;
};

export function FormToggleStatus({ formId, status, setOpen }: Props) {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.forms' });
  const { toggleStatus, loading } = useFormToggleStatus();

  const onSelect = () => {
    toggleStatus({
      variables: {
        ids: [formId],
      },
      refetchQueries: [GET_FORMS_LIST, GET_FORMS_TOTAL_COUNT],
      onCompleted: () => {
        setOpen(false);
      },
      onError: (error) => {
        toast({
          title: t('error', 'Error'),
          variant: 'destructive',
          description: error.message,
        });
      },
    });
  };

  return (
    <DropdownMenu.Item onSelect={onSelect}>
      <IconSquareToggle />
      {status === 'active'
        ? t('archive', 'Archive')
        : t('unarchive', 'Unarchive')}
    </DropdownMenu.Item>
  );
}
