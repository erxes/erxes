import {
  Button,
  Form,
  Input,
  Popover,
  Spinner,
  cn,
  useConfirm,
} from 'erxes-ui';
import { LabelFormType, labelFormSchema } from './constants/labelFormSchema';
import { useEffect, useRef } from 'react';
import {
  usePipelineLabelAdd,
  usePipelineLabelDetail,
  usePipelineLabelEdit,
  usePipelineLabelRemove,
} from '@/deals/pipelines/hooks/usePipelineDetails';

import { COLORS } from './constants/colors';
import { IconLoader } from '@tabler/icons-react';
import { TwitterPicker } from 'react-color';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const LabelForm = ({
  onSuccess,
  labelId,
}: {
  onSuccess?: () => void;
  labelId?: string | null;
}) => {
  const form = useForm<LabelFormType>({
    resolver: zodResolver(labelFormSchema),
  });

  const closeRef = useRef<HTMLButtonElement>(null);
  const isEdit = Boolean(labelId);
  const { confirm } = useConfirm();

  const handleSuccess = () => {
    form.reset();
    onSuccess?.();
  };

  const { pipelineLabelDetail, loading: labelDetailLoading } =
    usePipelineLabelDetail({
      skip: !labelId,
      variables: { _id: labelId },
    });

  useEffect(() => {
    if (pipelineLabelDetail && labelId) {
      form.reset({
        name: pipelineLabelDetail.name,
        colorCode: pipelineLabelDetail.colorCode,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineLabelDetail, labelId]);

  const { addPipelineLabel, loading } = usePipelineLabelAdd({
    onCompleted: () => {
      handleSuccess();
    },
  });

  const { editPipelineLabel } = usePipelineLabelEdit({
    onCompleted: () => {
      handleSuccess();
    },
  });

  const { removePipelineLabel, loading: deleteLoading } =
    usePipelineLabelRemove({
      onCompleted: () => {
        handleSuccess();
      },
    });

  const onSubmit = (data: LabelFormType) => {
    if (isEdit) {
      editPipelineLabel({
        variables: {
          ...data,
          _id: labelId,
        },
      });
    } else {
      addPipelineLabel({
        variables: {
          ...data,
        },
      });
    }
  };

  const handleDelete = () => {
    if (!labelId) return;

    confirm({
      message: `Are you sure you want to delete ${pipelineLabelDetail?.name}?`,
    }).then(() => {
      removePipelineLabel({
        variables: { _id: labelId },
      });
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full overflow-hidden"
      >
        {labelId && labelDetailLoading ? (
          <div className="flex justify-center items-center h-48">
            <Spinner />
          </div>
        ) : (
          <div className="flex-auto flex flex-col overflow-hidden py-2 gap-4">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>NAME</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="colorCode"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Select a color</Form.Label>
                  <TwitterPicker
                    colors={COLORS}
                    color={field.value}
                    triangle="hide"
                    onChangeComplete={(color) => field.onChange(color.hex)}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        )}

        <div className="flex justify-end flex-shrink-0 gap-3">
          {isEdit && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              Delete
            </Button>
          )}
          <Popover.Close ref={closeRef}>
            <Button
              type="button"
              variant="ghost"
              className="bg-background hover:bg-background/90"
            >
              Cancel
            </Button>
          </Popover.Close>
          <Button
            type="submit"
            className={cn(
              loading
                ? 'bg-primary/50 text-primary-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            {loading ? <IconLoader className="w-4 h-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LabelForm;
