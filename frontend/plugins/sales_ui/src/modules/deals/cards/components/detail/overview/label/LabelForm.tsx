import {
  usePipelineLabelAdd,
  usePipelineLabelDetail,
  usePipelineLabelEdit,
  usePipelineLabelRemove,
} from '@/deals/pipelines/hooks/usePipelineDetails';
import {
  Button,
  Form,
  Input,
  Popover,
  Spinner,
  cn,
  toast,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { useEffect, useRef } from 'react';
import { LabelFormType, labelFormSchema } from './constants/labelFormSchema';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader } from '@tabler/icons-react';
import { TwitterPicker } from 'react-color';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { COLORS } from './constants/colors';

export const LabelForm = ({
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
  const [pipelineId] = useQueryState<string>('pipelineId');
  const { confirm } = useConfirm();

  const handleSuccess = () => {
    form.reset();
    onSuccess?.();
  };

  const { pipelineLabelDetail, loading: labelDetailLoading } =
    usePipelineLabelDetail({
      skip: !labelId,
      variables: labelId ? { _id: labelId } : undefined,
    });

  useEffect(() => {
    if (pipelineLabelDetail && labelId) {
      form.reset({
        name: pipelineLabelDetail.name,
        colorCode: pipelineLabelDetail.colorCode ?? '',
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
    if (!pipelineId) {
      toast({
        title: t('pipeline-not-selected'),
        description: t('select-pipeline-first'),
        variant: 'destructive',
      });
      return;
    }

    if (labelId) {
      editPipelineLabel({
        variables: {
          ...data,
          _id: labelId,
          pipelineId,
        },
      });
    } else {
      addPipelineLabel({
        variables: {
          ...data,
          pipelineId,
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
        variables: labelId ? { _id: labelId } : undefined,
      });
    });
  };

  const { t } = useTranslation('sales');

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full px-2 py-2"
      >
        {labelId && labelDetailLoading ? (
          <div className="flex justify-center items-center h-48">
            <Spinner />
          </div>
        ) : (
          <div className="flex-auto flex flex-col">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('name')}</Form.Label>
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
                  <Form.Label>{t('select-color')}</Form.Label>
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

        <div className="flex justify-end shrink-0 gap-3">
          {isEdit && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="mt-2"
            >
              {t('delete')}
            </Button>
          )}
          <Popover.Close ref={closeRef}>
            <Button
              type="button"
              variant="ghost"
              className="bg-background hover:bg-background/90 mt-2"
            >
              {t('cancel')}
            </Button>
          </Popover.Close>
          <Button
            type="submit"
            className={cn(
              loading
                ? 'bg-primary/50 text-primary-foreground mt-2'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 mt-2',
            )}
          >
            {loading ? (
              <IconLoader className="w-4 h-4 animate-spin" />
            ) : (
              t('save')
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
