import { IconChalkboard } from '@tabler/icons-react';
import { Button, Form, Sheet, Spinner, useToast } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { useChannelById } from '@/settings/hooks/useChannels';
import { ChannelForm } from './ChannelForm';
import { useChannelForm } from '@/settings/hooks/useChannelForm';
import { type SubmitHandler } from 'react-hook-form';
import { TChannelForm } from '@/settings/types/channel';
import React from 'react';
import { useChannelsEdit } from '@/settings/hooks/useChannelsEdit';
import { ApolloError } from '@apollo/client';

export function ChannelDetailSheet() {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('channel_id');

  const {
    methods,
    methods: { handleSubmit, reset },
  } = useChannelForm();

  const { channel } = useChannelById({
    variables: {
      id,
    },
  });

  const { channelsEdit, loading: isLoading } = useChannelsEdit();

  const setOpen = (newChannelId: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newChannelId) {
      newSearchParams.set('channel_id', newChannelId);
    } else {
      newSearchParams.delete('channel_id');
    }
    setSearchParams(newSearchParams);
  };

  const submitHandler: SubmitHandler<TChannelForm> = React.useCallback(
    async (data) => {
      channelsEdit(
        {
          variables: {
            id: channel._id,
            name: data.name,
            description: data.description,
            memberIds: data.memberIds,
          },
          onError: (error: ApolloError) =>
            toast({ title: error.message, variant: 'destructive' }),
        },
        ['name', 'description', 'memberIds'],
      );
    },
    [channelsEdit, channel],
  );

  React.useEffect(() => {
    if (!channel) return;
    reset({
      name: channel?.name,
      description: channel?.description,
      memberIds: channel?.memberIds,
    });
  }, [channel]);

  return (
    <Sheet
      open={!!id}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpen(null);
        }
      }}
    >
      <Sheet.View className="p-0">
        <Form {...methods}>
          <form
            className="flex flex-col gap-0 size-full"
            onSubmit={handleSubmit(submitHandler)}
          >
            <Sheet.Header className="gap-2">
              <IconChalkboard size={16} />
              <Sheet.Title>{channel?.name || ''}</Sheet.Title>
              <Sheet.Close />
              <Sheet.Description className="sr-only">
                Channel details
              </Sheet.Description>
            </Sheet.Header>
            <Sheet.Content className="grow size-full flex flex-col px-5 py-4">
              <ChannelForm control={methods.control} />
            </Sheet.Content>
            <Sheet.Footer>
              <Button variant={'ghost'} onClick={() => setOpen(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner /> : 'Save'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}
