import { Sheet, Spinner } from 'erxes-ui';
import { AutomationIgBotFormContent } from '~/widgets/automations/modules/instagram/components/bots/components/AutomationIgBotFormContent';
import { useInstagramBotForm } from '~/widgets/automations/modules/instagram/components/bots/hooks/useInstagramBotForm';
import { IgBotFormProvider } from '../context/IgBotFormContext';

export const AutomationBotForm = ({
  instagramBotId,
}: {
  instagramBotId: string | null;
}) => {
  const { loadingDetail, instagramMessengerBot } =
    useInstagramBotForm(instagramBotId);

  if (loadingDetail) {
    return <Spinner />;
  }

  return (
    <>
      <Sheet.Header>
        <Sheet.Title className="capitalize">
          {instagramBotId ? 'Edit' : 'Add new'} facebook bot
        </Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>

      <IgBotFormProvider instagramMessengerBot={instagramMessengerBot}>
        <AutomationIgBotFormContent />
      </IgBotFormProvider>
    </>
  );
};
