import { IconTemplate } from '@tabler/icons-react';
import { Button, Input, Popover, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useBroadcastEmailTemplateAdd } from '../hooks/useBroadcastEmailTemplateAdd';

export const BroadcastSaveAsTemplate = () => {
  const { getValues } = useFormContext();
  const { toast } = useToast();
  const { addEmailTemplate, loading } = useBroadcastEmailTemplateAdd();

  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    const contentJson = getValues('email.contentJson');

    addEmailTemplate({
      variables: { name, contentJson },
      onCompleted: () => {
        toast({ variant: 'default', title: `Saved template "${name}"` });
        setName('');
        setOpen(false);
      },
      onError: (error) => {
        toast({ variant: 'destructive', title: error.message });
      },
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="secondary" type="button">
          <IconTemplate />
          Save as template
        </Button>
      </Popover.Trigger>
      <Popover.Content className="flex flex-col gap-2 w-80">
        <Input
          placeholder="Template name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          type="button"
          disabled={!name || loading}
          onClick={handleSave}
          className="w-full"
        >
          {loading ? 'Saving...' : 'Save template'}
        </Button>
      </Popover.Content>
    </Popover>
  );
};
