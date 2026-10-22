import { AddProjectForm } from '@/project/components/add-project/AddProjectForm';
import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const AddProjectRelation = ({
  onSelect,
  label,
  disabled,
}: {
  onSelect: (projectId: string) => void;
  label?: string;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('operation');
  const [open, setOpen] = useState(false);

  const onClose = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        {label ? (
          <Button disabled={disabled} onClick={(e) => e.stopPropagation()}>
            <IconPlus className="size-4" />
            {label}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            aria-label={t('add-project')}
            disabled={disabled}
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
        <AddProjectForm onClose={onClose} onComplete={onSelect} />
      </Sheet.View>
    </Sheet>
  );
};
