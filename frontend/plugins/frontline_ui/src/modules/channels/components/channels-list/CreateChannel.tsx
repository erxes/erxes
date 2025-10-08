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

export const CreateChannel = () => {
  const navigate = useNavigate();
  const form = useChannelsForm({});
  const { addChannel, loading } = useChannelAdd();
  const [_open, _setOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    _setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(ChannelHotKeyScope.ChannelAddSheet);
  };

  const onClose = () => {
    setHotkeyScope(ChannelHotKeyScope.ChannelSettingsPage);
    _setOpen(false);
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
          _setOpen(false);
        },
        onError: (error) =>
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [addChannel, toast, _setOpen, form],
  );

  return (
    <Sheet open={_open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Create channel
          <Kbd>C</Kbd>
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
