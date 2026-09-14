import { AutomationHistories } from '@/automations/components/builder/history/components/AutomationHistories';
import { AutomationProvider } from '@/automations/context/AutomationProvider';
import { useAutomationDetail } from '@/automations/hooks/useAutomationDetail';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { IAutomation } from '@/automations/types';
import { ReactFlowProvider } from '@xyflow/react';
import { Skeleton } from 'erxes-ui';
import { FormProvider, useForm } from 'react-hook-form';

/**
 * Every run the campaign started, one row per customer.
 *
 * The campaign's own traces say what the campaign did — batched, dispatched,
 * completed. What each customer's flow then did is the automation's history,
 * so it is shown here as it is rather than summarised a second time. It is
 * given the same providers the builder page gives it: the automation itself,
 * so action and trigger ids resolve to the steps they name.
 */
export const BroadcastTabHistoryContent = ({
  message,
}: {
  message: { workflowAutomationId?: string };
}) => {
  const { workflowAutomationId } = message || {};
  const { automation, loading } = useAutomationDetail(workflowAutomationId);

  if (loading || !automation) {
    return <Skeleton className="m-5 h-[32rem] flex-1" />;
  }

  return <BroadcastHistories automation={automation} />;
};

/**
 * Mounted only once the automation has loaded, because the flow's nodes read
 * their step out of a form seeded from it: a node drawn without one has no
 * configuration to show and throws reaching for it.
 */
const BroadcastHistories = ({ automation }: { automation: IAutomation }) => {
  const form = useForm<TAutomationBuilderForm>({
    defaultValues: {
      ...automation,
      triggers: automation.triggers || [],
      actions: automation.actions || [],
    } as TAutomationBuilderForm,
  });

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col">
      <AutomationProvider scoped detail={automation}>
        <ReactFlowProvider>
          <FormProvider {...form}>
            <AutomationHistories automationId={automation._id} />
          </FormProvider>
        </ReactFlowProvider>
      </AutomationProvider>
    </div>
  );
};
