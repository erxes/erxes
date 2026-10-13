import { useConfirm, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export type TKbRemoveRequest = {
  message: string;
  removedMessage: string;
  remove: () => Promise<unknown>;
  onRemoved?: () => void;
};

export const useKbConfirmRemove = () => {
  const { t } = useTranslation('frontline');
  const { confirm } = useConfirm();
  const { toast } = useToast();

  return ({ message, removedMessage, remove, onRemoved }: TKbRemoveRequest) =>
    confirm({
      message,
      options: {
        confirmationValue: 'delete',
        description: t(
          'kb-action-permanent',
          'This action is permanent and cannot be undone.',
        ),
      },
    }).then(async () => {
      try {
        await remove();
        toast({
          title: t('success'),
          description: removedMessage,
          variant: 'success',
        });
        onRemoved?.();
      } catch (error: unknown) {
        toast({
          title: t('error'),
          description:
            error instanceof Error ? error.message : t('something-went-wrong'),
          variant: 'destructive',
        });
      }
    });
};
