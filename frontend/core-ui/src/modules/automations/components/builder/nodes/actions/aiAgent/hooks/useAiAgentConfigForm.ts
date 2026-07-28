import {
  aiAgentConfigFormSchema,
  getDefaultAiAgentMemoryConfig,
  TAiAgentConfigForm,
} from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { useAiAgents } from '@/automations/components/settings/components/agents/hooks/useAiAgents';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { TAutomationAction, useFormValidationErrorHandler } from 'ui-modules';

type TAiAgentInputMapping = NonNullable<TAiAgentConfigForm['inputMapping']>;

const runtimeTokenRegex = /^\s*\{\{\s*([^{}]+?)\s*\}\}\s*$/;
const nestedRuntimeTokenRegex =
  /\{\{\s*(?:trigger|actions\.[^.\s{}]+)\.(\{\{\s*([^{}]+?)\s*\}\})\s*\}\}/g;

const unwrapRuntimeToken = (value?: string) => {
  const match = value?.match(runtimeTokenRegex);

  return match?.[1]?.trim();
};

const normalizeAiAgentInput = (input?: string) => {
  if (!input) {
    return input;
  }

  return input.replace(
    nestedRuntimeTokenRegex,
    (_match, _innerToken: string, innerPath: string) => `{{ ${innerPath} }}`,
  );
};

const normalizeInputMapping = (
  inputMapping?: TAiAgentInputMapping,
): TAiAgentInputMapping | undefined => {
  if (!inputMapping?.path) {
    return inputMapping;
  }

  const unwrappedPath = unwrapRuntimeToken(inputMapping.path);

  if (!unwrappedPath) {
    return inputMapping;
  }

  if (inputMapping.source === 'trigger') {
    return {
      ...inputMapping,
      path: unwrappedPath.startsWith('trigger.')
        ? unwrappedPath.slice(8)
        : unwrappedPath,
    };
  }

  if (inputMapping.source === 'previousAction') {
    return {
      ...inputMapping,
      path: unwrappedPath.startsWith('actions.')
        ? unwrappedPath.slice(8)
        : unwrappedPath,
    };
  }

  return {
    ...inputMapping,
    path: unwrappedPath,
  };
};

const getInputFromLegacyMapping = (inputMapping?: TAiAgentInputMapping) => {
  const normalizedInputMapping = normalizeInputMapping(inputMapping);

  if (!normalizedInputMapping) {
    return '';
  }

  if (normalizedInputMapping.source === 'custom') {
    return normalizedInputMapping.customValue || '';
  }

  const path = normalizedInputMapping.path?.trim();

  if (!path) {
    return '';
  }

  if (normalizedInputMapping.source === 'previousAction') {
    const actionPath = path.startsWith('actions.') ? path : `actions.${path}`;

    return `{{ ${actionPath} }}`;
  }

  const triggerPath = path.startsWith('trigger.') ? path : `trigger.${path}`;

  return `{{ ${triggerPath} }}`;
};

export const useAiAgentConfigForm = ({
  currentAction,
}: {
  currentAction?: TAutomationAction<TAiAgentConfigForm>;
}) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Ai agent node Configuration',
  });
  const form = useForm<TAiAgentConfigForm>({
    resolver: zodResolver(aiAgentConfigFormSchema),
    defaultValues: {
      ...(currentAction?.config || {}),
      inputMapping: normalizeInputMapping(currentAction?.config?.inputMapping),
      input:
        normalizeAiAgentInput(currentAction?.config?.input) ??
        getInputFromLegacyMapping(currentAction?.config?.inputMapping),
      memory:
        currentAction?.config?.memory ??
        getDefaultAiAgentMemoryConfig(currentAction?.config?.goalType),
    },
  });
  const { automationsAiAgents } = useAiAgents();
  const { t } = useTranslation('automations');

  const { control, handleSubmit, setValue } = form;
  const config = useWatch<TAiAgentConfigForm>({
    control,
  });
  const selectedAgent = useMemo(
    () =>
      automationsAiAgents.find(({ _id }) => _id === config?.aiAgentId) || null,
    [automationsAiAgents, config?.aiAgentId],
  );
  const previousGoalTypeRef = useRef(currentAction?.config?.goalType);

  useEffect(() => {
    if (!config?.goalType) {
      previousGoalTypeRef.current = config?.goalType;
      return;
    }

    if (previousGoalTypeRef.current !== config.goalType) {
      setValue('memory', getDefaultAiAgentMemoryConfig(config.goalType), {
        shouldDirty: true,
      });
    }

    previousGoalTypeRef.current = config.goalType;
  }, [config?.goalType, setValue]);
  return {
    form,
    handleSubmit,
    handleValidationErrors,
    selectedAgent,
    config,
    control,
    t,
    automationsAiAgents,
  };
};
