import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
  useToast,
} from 'erxes-ui';
import { useResponseAdd } from '@/responseTemplate/hooks/useAddResponse';
import { useNavigate } from 'react-router';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { ResponseHotkeyScope } from '@/responseTemplate/types/ResponseHotkeyScope';
import { CreateResponseForm } from '@/responseTemplate/components/CreateResponseForm';
import { TCreateResponseForm } from '@/responseTemplate/types';

export const CreateResponse = () => {
  const { id: channelId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { addResponse, loading } = useResponseAdd();

  const [open, setOpen] = useState(false);

  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  // Sheet open
  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      ResponseHotkeyScope.ResponseAddSheet,
    );
  };

  // Sheet close
  const onClose = () => {
    setOpen(false);
    setHotkeyScope(ResponseHotkeyScope.ResponseSettingsPage);
  };

  // Hotkeys
  useScopedHotkeys('c', onOpen, ResponseHotkeyScope.ResponseSettingsPage);
  useScopedHotkeys('esc', onClose, ResponseHotkeyScope.ResponseAddSheet);

  const onSubmit = (data: TCreateResponseForm) => {
    if (!channelId) return;

    addResponse({
      variables: { ...data, channelId },
      onCompleted: (res) => {
        toast({ title: 'Success!' });
        setOpen(false);
        navigate(
          `/settings/frontline/channels/${channelId}/response/${res.createResponses._id}`,
        );
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  if (!channelId) return null;

  return (
    <Sheet open={open} onOpenChange={(state) => (state ? onOpen() : onClose())}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Create response template
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>

      <Sheet.View className="p-0">
        <Sheet.Header>
          <Sheet.Title>Add response template</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="grow flex flex-col px-5 py-4">
          <CreateResponseForm
            type="create"
            defaultValues={{
              name: '',
              content: '',
              channelId,
            }}
            onSubmit={onSubmit}
            loading={loading}
          />
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
