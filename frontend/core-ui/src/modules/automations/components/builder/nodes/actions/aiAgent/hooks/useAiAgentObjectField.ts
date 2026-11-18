import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { useFormContext, useWatch } from 'react-hook-form';

export type TAiAgentFieldsGroupName = 'objectFields' | 'captureFields';

type TAiAgentFieldSuffix = 'fieldName' | 'prompt' | 'validation' | 'dataType';

/** One open field row: its form paths, and whether it asks for options. */
export const useAiAgentObjectField = (
  index: number,
  name: TAiAgentFieldsGroupName,
) => {
  const { control } = useFormContext<TAiAgentConfigForm>();
  // captureFields items share the exact shape of objectFields items, so the
  // objectFields path type is reused while the runtime path stays correct.
  const fieldPath = <S extends TAiAgentFieldSuffix>(suffix: S) =>
    `${name}.${index}.${suffix}` as `objectFields.${number}.${S}`;
  const isOption =
    useWatch({ control, name: fieldPath('dataType') }) === 'option';

  return { control, fieldPath, isOption };
};
