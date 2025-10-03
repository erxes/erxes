import { IconChalkboard, IconPlus } from '@tabler/icons-react';
import {
  Button,
  Form,
  Sheet,
  Spinner,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useChannelForm } from '../../hooks/useChannelForm';
import { ChannelForm } from './details/ChannelForm';
import { useChannelsAdd } from '../../hooks/useChannelsAdd';
import { SubmitHandler } from 'react-hook-form';
import { ChannelHotKeyScope, TChannelForm } from '../../types/channel';
import React from 'react';

export function ChannelAdd() {
  const { toast } = useToast();
  const { channelsAdd, loading } = useChannelsAdd();
  const {
    methods,
    methods: { handleSubmit, control, reset },
  } = useChannelForm();
  const [_open, _setOpen] = useState<boolean>(false);
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    _setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(ChannelHotKeyScope.ChannelAdd);
  };

  const onClose = () => {
    setHotkeyScope(ChannelHotKeyScope.ChannelSettingsPage);
    _setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), ChannelHotKeyScope.ChannelSettingsPage);
  useScopedHotkeys(`esc`, () => onClose(), ChannelHotKeyScope.ChannelAdd);

  const submitHandler: SubmitHandler<TChannelForm> = React.useCallback(
    async (data) => {
      channelsAdd({
        variables: data,
        onCompleted: () => {
          toast({ title: 'Success!' });
          reset();
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
    [channelsAdd],
  );
  return (
    <Sheet open={_open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Create channel
          <kbd>C</kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0">
        <Form {...methods}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={handleSubmit(submitHandler)}
          >
            <Sheet.Header className="gap-2">
              <IconChalkboard size={16} />
              <Sheet.Title>Create channel</Sheet.Title>
              <Sheet.Close />
              <Sheet.Description className="sr-only">
                Create channel
              </Sheet.Description>
            </Sheet.Header>
            <Sheet.Content className="grow size-full flex flex-col px-5 py-4">
              <ChannelForm control={control} />
            </Sheet.Content>
            <Sheet.Footer>
              <Button variant={'ghost'} onClick={() => _setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : 'Save'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}
