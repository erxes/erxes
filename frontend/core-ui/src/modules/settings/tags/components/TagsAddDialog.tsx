import {
  Button,
  Dialog,
  Form,
  Kbd,
  Spinner,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useToast,
} from 'erxes-ui';
import { IconPlus, IconTagPlus, IconX } from '@tabler/icons-react';
import { SettingsHotKeyScope } from '@/types/SettingsHotKeyScope';
import { useState } from 'react';
import { TTagsForm, useTagsForm } from '../hooks/useTagsForm';
import { TagsForm } from './TagsForm';
import { useTagsAdd } from '../hooks/useTagsAdd';

export const TagsAddDialog = () => {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const {
    methods,
    methods: { reset, handleSubmit },
  } = useTagsForm();
  const { addTag, loading } = useTagsAdd();

  const submitHandler = (data: TTagsForm) => {
    addTag({
      variables: data,
      onCompleted: () => {
        toast({ title: 'Tag added successfully.' });
        reset();
        setOpen(false);
      },
    });
  };
  const onOpen = (open: boolean) => {
    setOpen(open);
    if (open) {
      setHotkeyScopeAndMemorizePreviousScope(SettingsHotKeyScope.TagsAddDialog);
    } else {
      goBackToPreviousHotkeyScope();
    }
  };

  useScopedHotkeys(`c`, () => onOpen(true), SettingsHotKeyScope.TagsPage);

  return (
    <Dialog open={open} onOpenChange={onOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          Add Tag
          <Kbd>C</Kbd>
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header className="flex-row">
          <Dialog.Title className="flex items-center gap-2">
            <IconTagPlus size={16} />
            Add Tag
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            Add a new tag to the system.
          </Dialog.Description>
          <Dialog.Close asChild>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-3"
            >
              <IconX />
            </Button>
          </Dialog.Close>
        </Dialog.Header>
        <Form {...methods}>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className="flex flex-col size-full gap-5"
          >
            <TagsForm />
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? <Spinner /> : 'Add'}
            </Button>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};
