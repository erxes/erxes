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
import { usePipelineAdd } from '@/pipelines/hooks/useAddPipeline';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { CREATE_PIPELINE_FORM_SCHEMA } from '@/settings/schema/pipeline';
import { zodResolver } from '@hookform/resolvers/zod';
import { TCreatePipelineForm } from '@/pipelines/types';
import { PipelineHotkeyScope } from '@/pipelines/types/PipelineHotkeyScope';
import { useNavigate } from 'react-router';
import { CreatePipelineForm } from './CreatePipelineForm';
import { useParams } from 'react-router-dom';

export const CreatePipeline = () => {
  const { id: channelId } = useParams<{ id: string }>();

  const form = useForm<TCreatePipelineForm>({
    resolver: zodResolver(CREATE_PIPELINE_FORM_SCHEMA),
    defaultValues: {
      name: '',
      description: '',
      channelId: channelId || '',
    },
  });

  const { addPipeline } = usePipelineAdd();
  const { toast } = useToast();

  const navigate = useNavigate();

  const [_open, _setOpen] = useState<boolean>(false);
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    _setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      PipelineHotkeyScope.PipelineAddSheet,
    );
  };

  const onClose = () => {
    setHotkeyScope(PipelineHotkeyScope.PipelineSettingsPage);
    _setOpen(false);
  };

  useScopedHotkeys(
    `c`,
    () => onOpen(),
    PipelineHotkeyScope.PipelineSettingsPage,
  );
  useScopedHotkeys(
    `esc`,
    () => onClose(),
    PipelineHotkeyScope.PipelineAddSheet,
  );
  const submitHandler: SubmitHandler<TCreatePipelineForm> = React.useCallback(
    async (data) => {
      addPipeline({
        variables: {
          ...data,
          channelId,
        },
        onCompleted: (data) => {
          form.reset();
          _setOpen(false);
          toast({ title: 'Success!' });
          navigate(
            `/settings/frontline/channels/${channelId}/pipelines/${data.createPipeline._id}`,
          );
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
            onSubmit={form.handleSubmit(submitHandler, (e) => console.log(e))}
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
