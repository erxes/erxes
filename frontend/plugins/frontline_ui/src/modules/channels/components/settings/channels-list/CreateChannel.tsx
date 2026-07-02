import { ChannelForm } from '@/channels/components/settings/channels-list/ChannelForm';
import { channelCreateSheetOpenState } from '@/channels/states';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  Form,
  Kbd,
  Sheet,
  Spinner,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
  useToast,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import React from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useChannelAdd } from '../../../hooks/useChannelAdd';
import { useChannelsForm } from '../../../hooks/useChannelsForm';
import { ChannelHotKeyScope, TChannelForm } from '../../../types';
import { useTranslation } from 'react-i18next';

type Props = {
  isIconOnly?: boolean;
};

export const CreateChannel = ({ isIconOnly = false }: Props) => {
  const { t } = useTranslation('frontline');
  const navigate = useNavigate();
  const form = useChannelsForm({});
  const { addChannel, loading } = useChannelAdd();
  const [open, setOpen] = useAtom(channelCreateSheetOpenState);
  const { toast } = useToast();
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(ChannelHotKeyScope.ChannelAddSheet);
  };

  const onClose = () => {
    if (!isIconOnly) {
      setHotkeyScope(ChannelHotKeyScope.ChannelSettingsPage);
    }
    setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), ChannelHotKeyScope.ChannelSettingsPage);
  useScopedHotkeys(`esc`, () => onClose(), ChannelHotKeyScope.ChannelAddSheet);

  const submitHandler: SubmitHandler<TChannelForm> = React.useCallback(
    async (data) => {
      addChannel({
        variables: data,
        onCompleted: (data) => {
          toast({ title: t('success') });
          navigate(`/settings/frontline/channels/${data.channelAdd._id}`);
          form.reset();
          setOpen(false);
        },
        onError: (error) =>
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [addChannel, toast, setOpen, form],
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button
          variant={isIconOnly ? 'ghost' : 'default'}
          size={isIconOnly ? 'icon' : 'default'}
        >
          <IconPlus />
          {!isIconOnly && (
            <>
              <span>{t('create-channel')}</span>
              <Kbd>C</Kbd>
            </>
          )}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0">
        <Form {...form}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={form.handleSubmit(submitHandler)}
          >
            <Sheet.Header>
              <Sheet.Title>{t('create-channel')}</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full flex flex-col px-5 py-4">
              <ChannelForm form={form} />
            </Sheet.Content>
            <Sheet.Footer>
              <Button variant={'ghost'} onClick={() => onClose()}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : t('create')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
