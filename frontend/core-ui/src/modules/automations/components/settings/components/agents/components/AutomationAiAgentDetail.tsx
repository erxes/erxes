import { AiAgentProfileBar } from '@/automations/components/settings/components/agents/components/detail/AiAgentProfileBar';
import { AiAgentStepContent } from '@/automations/components/settings/components/agents/components/detail/AiAgentStepContent';
import { AiAgentStepNav } from '@/automations/components/settings/components/agents/components/detail/AiAgentStepNav';
import {
  AI_AGENT_PROVIDER_TYPES,
  TAiAgentProvider,
} from '@/automations/components/settings/components/agents/constants/providers';
import { AiAgentDetailProvider } from '@/automations/components/settings/components/agents/context/AiAgentDetailContext';
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
import { MutableRefObject, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

type TRequestCloseRef = MutableRefObject<(() => void) | null>;

const AiAgentDetailView = ({
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

  return (
    <AiAgentDetailProvider value={state}>
      <AiAgentProfileBar />
      <AiAgentStepNav />
      <AiAgentStepContent />
    </AiAgentDetailProvider>
  );
};

export const AutomationAiAgentDetail = ({
  detail,
  handleSave,
  onClose,
  requestCloseRef,
  persistStepInUrl,
}: {
  detail?: TAiAgentFormDetail;
  handleSave: (input: AiAgentInput) => Promise<unknown>;
  onClose: () => void;
  requestCloseRef: TRequestCloseRef;
  persistStepInUrl: boolean;
}) => {
  const { t } = useTranslation('automations');

  const [searchParams] = useSearchParams();
  const queryKind = searchParams.get('kind');
  const defaultProvider =
    !detail && AI_AGENT_PROVIDER_TYPES.includes(queryKind as TAiAgentProvider)
      ? (queryKind as TAiAgentProvider)
      : undefined;

  const form = useForm<TAiAgentForm>({
    resolver: zodResolver(
      buildAiAgentFormSchema({ requireApiKey: !detail?._id }),
    ),
    values: normalizeAiAgentFormValues(detail, defaultProvider),
  });

  const save = form.handleSubmit(handleSave, () => {
    toast({
      title: t('settings-agent-invalid-form'),
      description: t('settings-agent-review-fields'),
      variant: 'destructive',
    });
  });

  return (
    <FormProvider {...form}>
      <AiAgentDetailView
        detail={detail}
        save={() => void save()}
        close={onClose}
        requestCloseRef={requestCloseRef}
        persistStepInUrl={persistStepInUrl}
      />
    </FormProvider>
  );
};
