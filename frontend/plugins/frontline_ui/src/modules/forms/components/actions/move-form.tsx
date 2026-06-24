import { GET_FORMS_LIST } from '@/forms/graphql/formQueries';
import { useFormEdit } from '@/forms/hooks/useFormEdit';
import { SelectChannel } from '@/inbox/channel/components/SelectChannel';
import { IconArrowBarToRight } from '@tabler/icons-react';
import { DropdownMenu, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

type Props = {
  formId: string;
  channelId: string;
  setOpen: (open: boolean) => void;
  name: string;
  type: string;
};

export const MoveFormToChannel = ({
  formId,
  channelId,
  setOpen,
  name,
  type,
}: Props) => {
  const { t } = useTranslation('frontline');
  const { editForm, loading } = useFormEdit();

  const onSelect = (id: string) => {
    editForm({
      variables: {
        id: formId,
        name,
        type,
        channelId: id,
      },
      refetchQueries: [GET_FORMS_LIST],
      onCompleted: () => {
        setOpen(false);
        toast({
          title: t('success'),
          variant: 'success',
          description: t('form-moved-successfully'),
        });
      },
      onError: (error) => {
        toast({
          title: t('error'),
          variant: 'destructive',
          description: error.message,
        });
      },
    });
  };

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>
        <IconArrowBarToRight />
        {t('move-to-channel')}
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent className="min-w-56" sideOffset={8}>
          <SelectChannel.DropDownContent
            channelId={channelId}
            onValueChange={(value) => {
              onSelect(value);
            }}
          />
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  );
};
