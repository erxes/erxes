import { Sheet, Spinner } from 'erxes-ui';
import { AutomationFbBotFormContent } from '~/widgets/automations/modules/facebook/components/bots/components/AutomationFbBotFormContent';
import { useFacebookBotForm } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotForm';
import { FbBotFormProvider } from '../context/FbBotFormContext';

export const AutomationBotForm = ({
  facebookBotId,
}: {
  facebookBotId: string | null;
}) => {
  const { loadingDetail, facebookMessengerBot } =
    useFacebookBotForm(facebookBotId);

  if (loadingDetail) {
    return <Spinner />;
  }

  return (
    <>
      <Sheet.Header>
        <Sheet.Title className="capitalize">
          {facebookBotId ? 'Edit' : 'Add new'} facebook bot
        </Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>

      <FbBotFormProvider facebookMessengerBot={facebookMessengerBot}>
        <AutomationFbBotFormContent />
      </FbBotFormProvider>
    </>
  );
};
