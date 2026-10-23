import { AddProjectForm } from '@/project/components/add-project/AddProjectForm';
import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';

export const AddProjectRelation = ({
  onSelect,
  label,
  contacts,
}: {
  onSelect?: (projectId: string) => void;
  label?: string;
  // Saved on the new project by createProject itself.
  contacts?: { customerId?: string; companyId?: string };
}) => {
  const [open, setOpen] = useState(false);

  const onClose = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        {label ? (
          <Button onClick={(e) => e.stopPropagation()}>
            <IconPlus className="size-4" />
            {label}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => e.stopPropagation()}
          >
            <IconPlus className="size-4" />
          </Button>
        )}
      </Sheet.Trigger>
      <Sheet.View
        className="sm:max-w-3xl w-full p-0"
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <AddProjectForm
          onClose={onClose}
          onComplete={onSelect}
          contacts={contacts}
        />
      </Sheet.View>
    </Sheet>
  );
};
