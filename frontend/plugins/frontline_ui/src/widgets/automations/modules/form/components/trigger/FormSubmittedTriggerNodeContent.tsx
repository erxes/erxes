import { AutomationNodeMetaInfoRow } from 'ui-modules';
import type { AutomationTriggerConfigProps } from 'ui-modules';
import { useFormDetail } from '@/forms/hooks/useFormDetail';
import { readFormSubmittedTriggerConfig } from '../../states/formSubmittedTriggerForm';

export const FormSubmittedTriggerNodeContent = ({
  config,
}: AutomationTriggerConfigProps<unknown>) => {
  const { formId, conditions, conjunction } =
    readFormSubmittedTriggerConfig(config);
  const { formDetail } = useFormDetail({ formId });

  const conditionsContent = conditions.length
    ? `${conditions.length} (${conjunction === 'or' ? 'any' : 'all'})`
    : 'Every submission';

  return (
    <>
      <AutomationNodeMetaInfoRow
        fieldName="Form"
        content={
          formId
            ? formDetail?.name || formDetail?.title || formId
            : 'No form selected'
        }
      />
      <AutomationNodeMetaInfoRow
        fieldName="Conditions"
        content={conditionsContent}
      />
    </>
  );
};
