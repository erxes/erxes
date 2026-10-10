import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import { IconTrash } from '@tabler/icons-react';
import { Button, useConfirm, useToast } from 'erxes-ui';
import { SEGMENT_REMOVE } from 'ui-modules';
import { TSplitConditionsConfigForm } from '../states/splitConditionsConfigForm';

export const SplitCondtionRemoveButton = ({
  index,
  option,
  disabled,
  onRemove,
}: {
  index: number;
  option: TSplitConditionsConfigForm['options'][number];
  disabled?: boolean;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('automations');
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const [removeSegment] = useMutation(SEGMENT_REMOVE);

  const removeOptionWithConfirmation = async () => {
    const optionLabel =
      option?.label || t('split-option-default-label', { number: index + 1 });

    try {
      if (option?.segmentId) {
        await confirm({
          message: t('split-delete-option-confirm', { label: optionLabel }),
          options: {
            description: t('split-delete-option-description'),
            okLabel: t('delete'),
            cancelLabel: t('cancel'),
          },
        });

        await removeSegment({
          variables: {
            id: option.segmentId,
          },
        });
      }

      onRemove();
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      disabled={disabled}
      onClick={removeOptionWithConfirmation}
    >
      <IconTrash className="size-4" />
    </Button>
  );
};
