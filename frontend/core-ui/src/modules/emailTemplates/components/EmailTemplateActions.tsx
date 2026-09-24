import { useEmailTemplateMutations } from '@/emailTemplates/hooks/useEmailTemplateMutations';
import { EmailTemplatePath } from '@/types/paths/EmailTemplatePath';
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import { Button, DropdownMenu, useConfirm, useToast } from 'erxes-ui';
import { useNavigate } from 'react-router';

export const EmailTemplateActions = ({
  templateId,
}: {
  templateId: string;
}) => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeEmailTemplate } = useEmailTemplateMutations();

  const handleRemove = () =>
    confirm({ message: 'Remove this email template?' }).then(() =>
      removeEmailTemplate({
        variables: { _id: templateId },
        onCompleted: () =>
          toast({ variant: 'success', title: 'Email template removed' }),
      }),
    );

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
        <DropdownMenu.Item className="text-destructive" onClick={handleRemove}>
          <IconTrash />
          Remove
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
