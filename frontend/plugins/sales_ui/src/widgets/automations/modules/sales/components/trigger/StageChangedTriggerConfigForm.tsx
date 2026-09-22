import {
  AutomationTriggerFormProps,
  useAutomationRemoteFormSubmit,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  TStageProbalityTriggerConfigForm,
  stageProbalityTriggerConfigFormSchema,
} from '../../states/stageProbalityTriggerConfigFormDefinitions';
import { useForm, useWatch } from 'react-hook-form';
import {
  SalesTriggerScopeFields,
  SalesTriggerStageField,
} from './SalesTriggerScopeFields';
import { zodResolver } from '@hookform/resolvers/zod';

export const StageChangedTriggerConfigForm = ({
  formRef,
  onSaveTriggerConfig,
  activeTrigger,
}: AutomationTriggerFormProps<TStageProbalityTriggerConfigForm>) => {
  const { t } = useTranslation('sales');
  const form = useForm<TStageProbalityTriggerConfigForm>({
    resolver: zodResolver(stageProbalityTriggerConfigFormSchema),
    defaultValues: {
      ...(activeTrigger?.config || {}),
    },
  });
  const { control, handleSubmit } = form;
  const [boardId, pipelineId] = useWatch({
    control,
    name: ['boardId', 'pipelineId'],
  });
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Stage Changed Trigger Configuration',
  });

  useAutomationRemoteFormSubmit({
    formRef,
    callback: () => {
      handleSubmit(onSaveTriggerConfig, handleValidationErrors)();
    },
  });

  return (
    <Form {...form}>
      <SalesTriggerScopeFields
        control={control}
        boardId={boardId}
        pipelineId={pipelineId}
        optional={false}
      >
        <div className="col-span-3">
          <SalesTriggerStageField
            control={control}
            name="fromStageId"
            label={t('from-stage')}
            pipelineId={pipelineId}
          />
          <SalesTriggerStageField
            control={control}
            name="toStageId"
            label={t('to-stage')}
            pipelineId={pipelineId}
          />
        </div>
      </SalesTriggerScopeFields>
    </Form>
  );
};
