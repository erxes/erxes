import { useChannelsForm } from '../../hooks/useChannelsForm';
import { useChannelAdd } from '../../hooks/useChannelAdd';
import { ChannelHotKeyScope, TChannelForm } from '../../types';
import { SubmitHandler } from 'react-hook-form';
import React, { useState } from 'react';
import {
  Form,
  Spinner,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
  useToast,
} from 'erxes-ui';
import { Sheet, Button, Kbd } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { ChannelForm } from '@/channels/components/channels-list/ChannelForm';
import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { channelCreateSheetOpenState } from '../../states';

type Props = {
  isIconOnly?: boolean;
};

export const CreateChannel = ({ isIconOnly = false }: Props) => {
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
          toast({ title: 'Success!' });
          navigate(
            `/settings/frontline/channels/details/${data.channelAdd._id}`,
          );
          form.reset();
          setOpen(false);
        },
        onError: (error) =>
          toast({
            title: 'Error',
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
        <Button>
          <IconPlus />
          {isIconOnly ? null : 'Create channel'}
          {!isIconOnly && <Kbd>C</Kbd>}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0">
        <Form {...form}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={form.handleSubmit(submitHandler)}
          >
            <Sheet.Header>
              <Sheet.Title>Create channel</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full flex flex-col px-5 py-4">
              <ChannelForm form={form} />
            </Sheet.Content>
            <Sheet.Footer>
              <Button variant={'ghost'} onClick={() => onClose()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : 'Create'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
