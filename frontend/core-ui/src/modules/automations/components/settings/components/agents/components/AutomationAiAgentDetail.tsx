import { AiAgentDetailFooter } from '@/automations/components/settings/components/agents/components/detail/AiAgentDetailFooter';
import { AiAgentProfileBar } from '@/automations/components/settings/components/agents/components/detail/AiAgentProfileBar';
import { AiAgentStepContent } from '@/automations/components/settings/components/agents/components/detail/AiAgentStepContent';
import { AiAgentStepNav } from '@/automations/components/settings/components/agents/components/detail/AiAgentStepNav';
import { AiAgentDetailProvider } from '@/automations/components/settings/components/agents/context/AiAgentDetailContext';
import { AiAgentInput } from '@/automations/components/settings/components/agents/hooks/useAiAgentDetail';
import {
  useAiAgentDetailView,
  useAutomationAiAgentDetail,
} from '@/automations/components/settings/components/agents/hooks/useAutomationAiAgentDetail';
import { TAiAgentFormDetail } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { MutableRefObject } from 'react';
import { FormProvider } from 'react-hook-form';

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
  const state = useAiAgentDetailView({
    detail,
    save,
    close,
    requestCloseRef,
    persistStepInUrl,
  });

  return (
    <AiAgentDetailProvider value={state}>
      <AiAgentProfileBar />
      <AiAgentStepNav />
      <AiAgentStepContent />
      <AiAgentDetailFooter />
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
  const { form, save } = useAutomationAiAgentDetail(detail, handleSave);

  return (
    <FormProvider {...form}>
      <AiAgentDetailView
        detail={detail}
        save={save}
        close={onClose}
        requestCloseRef={requestCloseRef}
        persistStepInUrl={persistStepInUrl}
      />
    </FormProvider>
  );
};
