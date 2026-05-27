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
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const [removeSegment] = useMutation(SEGMENT_REMOVE);

  const removeOptionWithConfirmation = async () => {
    const optionLabel = option?.label || `Option ${index + 1}`;

    try {
      if (option?.segmentId) {
        await confirm({
          message: `Delete "${optionLabel}"?`,
          options: {
            description:
              'This action cannot be undone. The split option and its associated segment will be permanently removed.',
            okLabel: 'Delete',
            cancelLabel: 'Cancel',
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
          title: 'Error',
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
