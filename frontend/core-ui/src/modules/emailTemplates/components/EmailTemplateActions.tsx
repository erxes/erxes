import { useEmailTemplateMutations } from '@/emailTemplates/hooks/useEmailTemplateMutations';
import { EmailTemplatePath } from '@/types/paths/EmailTemplatePath';
import { IconDots, IconPencil, IconTrash } from '@tabler/icons-react';
import { Button, DropdownMenu, useConfirm, useToast } from 'erxes-ui';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';

export const EmailTemplateActions = ({
  templateId,
}: {
  templateId: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'email-templates' });
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const { removeEmailTemplate } = useEmailTemplateMutations();

  const handleRemove = () =>
    confirm({ message: t('remove-confirm') }).then(() =>
      removeEmailTemplate({
        variables: { _id: templateId },
        onCompleted: () => toast({ variant: 'success', title: t('removed') }),
      }),
    );

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          aria-label={t('template-actions')}
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
          {t('edit')}
        </DropdownMenu.Item>
        <DropdownMenu.Item className="text-destructive" onClick={handleRemove}>
          <IconTrash />
          {t('remove')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
