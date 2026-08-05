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
import { usePipelineAdd } from '@/pipelines/hooks/useAddPipeline';
import { useAtom } from 'jotai';
import React, { useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { CREATE_PIPELINE_FORM_SCHEMA } from '@/settings/schema/pipeline';
import { zodResolver } from '@hookform/resolvers/zod';
import { TCreatePipelineForm } from '@/pipelines/types';
import { PipelineHotkeyScope } from '@/pipelines/types/PipelineHotkeyScope';
import { createPipelineSheetState } from '@/pipelines/states/pipelineStates';
import { CreatePipelineForm } from './CreatePipelineForm';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CreatePipelineSheetForm = ({
  channelId,
  onClose,
}: {
  channelId: string;
  onClose: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addPipeline, loading } = usePipelineAdd();

  const form = useForm<TCreatePipelineForm>({
    resolver: zodResolver(CREATE_PIPELINE_FORM_SCHEMA),
    defaultValues: {
      name: '',
      description: '',
      channelId,
    },
  });

  const submitHandler: SubmitHandler<TCreatePipelineForm> = React.useCallback(
    async (data) => {
      addPipeline({
        variables: { ...data, channelId },
        onCompleted: (response) => {
          form.reset();
          onClose();
          toast({ title: t('success') });
          navigate(
            `/settings/frontline/channels/${channelId}/pipelines/${response.createPipeline._id}`,
          );
        },
        onError: (error) =>
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [addPipeline, channelId, form, navigate, onClose, t, toast],
  );

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-0 size-full"
        onSubmit={form.handleSubmit(submitHandler)}
      >
        <Sheet.Header>
          <Sheet.Title>{t('add-pipeline')}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grow size-full flex flex-col px-5 py-4">
          <CreatePipelineForm form={form} />
        </Sheet.Content>
        <Sheet.Footer>
          <Button
            disabled={loading}
            onClick={onClose}
            type="button"
            variant="secondary"
          >
            {t('cancel')}
          </Button>
          <Button disabled={loading} type="submit">
            {loading ? <Spinner /> : t('create')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};

export const CreatePipeline = () => {
  const { t } = useTranslation('frontline');
  const { id: channelId } = useParams<{ id: string }>();

  const [open, setOpen] = useAtom(createPipelineSheetState);
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  useEffect(() => {
    if (open) {
      setHotkeyScopeAndMemorizePreviousScope(
        PipelineHotkeyScope.PipelineAddSheet,
      );
      return;
    }

    setHotkeyScope(PipelineHotkeyScope.PipelineSettingsPage);
  }, [open, setHotkeyScope, setHotkeyScopeAndMemorizePreviousScope]);

  useScopedHotkeys(
    'c',
    () => setOpen(true),
    PipelineHotkeyScope.PipelineSettingsPage,
  );
  useScopedHotkeys(
    'esc',
    () => setOpen(false),
    PipelineHotkeyScope.PipelineAddSheet,
  );

  // The sheet lives in a shared atom, so leaving this surface with it open
  // would otherwise reopen it on the way back and strand the hotkey scope on
  // the sheet. The effect above cannot do this: its cleanup runs on every
  // `open` change, not just on unmount.
  useEffect(
    () => () => {
      setOpen(false);
      setHotkeyScope(PipelineHotkeyScope.PipelineSettingsPage);
    },
    [setHotkeyScope, setOpen],
  );

  if (!channelId) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('create-pipeline')}
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="p-0">
        <CreatePipelineSheetForm
          channelId={channelId}
          onClose={() => setOpen(false)}
        />
      </Sheet.View>
    </Sheet>
  );
};
