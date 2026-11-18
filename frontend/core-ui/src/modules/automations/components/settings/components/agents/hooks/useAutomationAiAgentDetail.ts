import {
  AI_AGENT_PROVIDER_TYPES,
  TAiAgentProvider,
} from '@/automations/components/settings/components/agents/constants/providers';
import { useAiAgentDefaultModel } from '@/automations/components/settings/components/agents/hooks/useAiAgentDefaultModel';
import { AiAgentInput } from '@/automations/components/settings/components/agents/hooks/useAiAgentDetail';
import { useAiAgentDetailState } from '@/automations/components/settings/components/agents/hooks/useAiAgentDetailState';
import {
  buildAiAgentFormSchema,
  normalizeAiAgentFormValues,
  TAiAgentForm,
  TAiAgentFormDetail,
} from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'erxes-ui';
import { MutableRefObject, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

type TRequestCloseRef = MutableRefObject<(() => void) | null>;

const isProvider = (kind: string | null): kind is TAiAgentProvider =>
  AI_AGENT_PROVIDER_TYPES.includes(kind as TAiAgentProvider);

/**
 * The agent form. A new agent may be started for one provider through
 * `?kind=`; an existing one needs no API key to be typed again.
 */
export const useAutomationAiAgentDetail = (
  detail: TAiAgentFormDetail | undefined,
  handleSave: (input: AiAgentInput) => Promise<unknown>,
) => {
  const { t } = useTranslation('automations');
  const [searchParams] = useSearchParams();
  const queryKind = searchParams.get('kind');
  const defaultProvider =
    !detail && isProvider(queryKind) ? queryKind : undefined;

  const form = useForm<TAiAgentForm>({
    resolver: zodResolver(
      buildAiAgentFormSchema({ requireApiKey: !detail?._id }),
    ),
    values: normalizeAiAgentFormValues(detail, defaultProvider),
  });

  const submit = form.handleSubmit(handleSave, () => {
    toast({
      title: t('settings-agent-invalid-form'),
      description: t('settings-agent-review-fields'),
      variant: 'destructive',
    });
  });

  const save = useCallback(() => void submit(), [submit]);

  return { form, save };
};

/**
 * The detail's step state, with its close request handed to whoever hosts
 * the sheet, so closing from outside asks about unsaved edits too.
 */
export const useAiAgentDetailView = ({
  detail,
  save,
  close,
  requestCloseRef,
  persistStepInUrl,
}: {
  detail?: TAiAgentFormDetail;
  save: () => void;
  close: () => void;
  requestCloseRef: TRequestCloseRef;
  persistStepInUrl: boolean;
}) => {
  const state = useAiAgentDetailState({
    detail,
    save,
    close,
    persistStepInUrl,
  });

  useAiAgentDefaultModel(!detail?._id);

  useEffect(() => {
    requestCloseRef.current = state.requestClose;
  });

  useEffect(
    () => () => {
      requestCloseRef.current = null;
    },
    [requestCloseRef],
  );

  return state;
};
