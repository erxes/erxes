import { EmailTemplatePath } from '@/types/paths/EmailTemplatePath';
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useNavigate } from 'react-router';

export const EmailTemplateActions = ({
  templateId,
  onRemove,
}: {
  templateId: string;
  onRemove: (id: string) => void;
}) => {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          aria-label="Template actions"
          onClick={(event) => event.stopPropagation()}
        >
          <IconDots className="size-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="end"
        onClick={(event) => event.stopPropagation()}
      >
        <DropdownMenu.Item
          onClick={() => navigate(`${EmailTemplatePath.Index}/${templateId}`)}
        >
          <IconPencil />
          Edit
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="text-destructive"
          onClick={() => onRemove(templateId)}
        >
          <IconTrash />
          Remove
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
