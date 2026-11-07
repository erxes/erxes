import { Spinner } from 'erxes-ui';
import { FacebookBotSimulator } from '~/widgets/automations/modules/facebook/components/bots/components/simulator/FacebookBotSimulator';
import { AutomationFbBotFormContent } from '~/widgets/automations/modules/facebook/components/bots/components/AutomationFbBotFormContent';
import { FbBotFormProvider } from '~/widgets/automations/modules/facebook/components/bots/context/FbBotFormContext';
import { useFacebookBotForm } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotForm';
import { TFacebookBotPage } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookIntegrationBot';

/**
 * The bot form without a surface of its own: the page is supplied by the
 * caller, so this renders inside a sheet or a dialog alike.
 */
export const FacebookBotFormBody = ({
  facebookBotId,
  page,
}: {
  facebookBotId: string | null;
  page: TFacebookBotPage;
}) => {
  const { loadingDetail, facebookMessengerBot } =
    useFacebookBotForm(facebookBotId);

  if (loadingDetail) {
    return <Spinner />;
  }

  return (
    <FbBotFormProvider facebookMessengerBot={facebookMessengerBot} page={page}>
      <div className="@container/bot-form flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="flex min-h-full flex-col @min-[900px]/bot-form:flex-row">
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <AutomationFbBotFormContent isPageFixed />
          </div>
          <div className="min-w-0 flex-1 border-t @min-[900px]/bot-form:border-l @min-[900px]/bot-form:border-t-0">
            <FacebookBotSimulator />
          </div>
        </div>
      </div>
    </FbBotFormProvider>
  );
};
