import { SelectBoard, SelectPipeline, SelectStage } from 'ui-modules';

import { Form } from 'erxes-ui';
import { dealCreateDefaultValuesState } from '@/deals/states/dealCreateSheetState';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const WorkflowFields = ({ control }: { control: any }) => {
  const [boardId, pipelineId, stageId] = useWatch({
    control,
    name: ['boardId', 'pipelineId', 'stageId'],
  });
  const setDefaultValues = useSetAtom(dealCreateDefaultValuesState);

  useEffect(() => {
    setDefaultValues({ stageId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageId]);

  const { t } = useTranslation('sales');

  return (
    <>
      <Form.Field
        control={control}
        name="boardId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('select-board')}</Form.Label>
            <SelectBoard.FormItem
              mode="single"
              onValueChange={field.onChange}
              value={field.value}
              className="focus-visible:relative focus-visible:z-10"
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="pipelineId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('select-pipeline')}</Form.Label>
            <SelectPipeline.FormItem
              mode="single"
              onValueChange={field.onChange}
              value={field.value}
              boardId={boardId}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={control}
        name="stageId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('select-stage')}</Form.Label>
            <SelectStage.FormItem
              mode="single"
              onValueChange={field.onChange}
              value={field.value}
              pipelineId={pipelineId}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
};

export default WorkflowFields;
