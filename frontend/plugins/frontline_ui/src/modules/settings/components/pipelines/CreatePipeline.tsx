import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  Form,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
  useToast,
} from 'erxes-ui';
import { usePipelineAdd } from '@/settings/hooks/usePipelineAdd';

import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { PIPELINE_FORM_SCHEMA } from '@/settings/schema/pipeline';
import { zodResolver } from '@hookform/resolvers/zod';
import { IPipeline } from '@/channels/types';
// import { TeamHotKeyScope, TTeamForm } from '@/team/types';
// import { CreateTeamForm } from '@/team/components/team-list/CreateTeamForm';
import { useNavigate } from 'react-router-dom';
import { CreatePipelineForm } from './CreatePipelineForm';
import { useParams } from 'react-router-dom';

export const CreatePipeline = () => {
  const { id: channelId } = useParams<{ id: string }>();

  const form = useForm<IPipeline>({
    resolver: zodResolver(PIPELINE_FORM_SCHEMA),
  });

  const { addPipeline, loading } = usePipelineAdd();
  const { toast } = useToast();

  const navigate = useNavigate();

  const [_open, _setOpen] = useState<boolean>(false);
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    _setOpen(true);
    // setHotkeyScopeAndMemorizePreviousScope(TeamHotKeyScope.TeamCreateSheet);
  };

  const onClose = () => {
    // setHotkeyScope(TeamHotKeyScope.TeamSettingsPage);
    _setOpen(false);
  };

  //   useScopedHotkeys(`c`, () => onOpen(), TeamHotKeyScope.TeamSettingsPage);
  //   useScopedHotkeys(`esc`, () => onClose(), TeamHotKeyScope.TeamCreateSheet);

  const submitHandler: SubmitHandler<IPipeline> = React.useCallback(
    async (data) => {
      addPipeline({
        variables: {
          ...data,
          channelId,
        },
        onCompleted: (data) => {
          toast({ title: 'Success!' });
          navigate(
            `/settings/frontline/channels/${channelId}/pipelines/${data.addPipeline._id}`,
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
    [addPipeline, toast, _setOpen, form, navigate, channelId],
  );
  if (!channelId) return null;
  return (
    <Sheet open={_open} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Create pipeline
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
              <Sheet.Title>Add pipeline</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full flex flex-col px-5 py-4">
              <CreatePipelineForm form={form} />
            </Sheet.Content>
            <Sheet.Footer>
              <Button variant={'secondary'} onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
