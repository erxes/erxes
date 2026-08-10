import { Sheet, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AutomationFbBotFormContent } from '~/widgets/automations/modules/facebook/components/bots/components/AutomationFbBotFormContent';
import { useFacebookBotForm } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotForm';
import { FbBotFormProvider } from '../context/FbBotFormContext';

export const AutomationBotForm = ({
  facebookBotId,
}: {
  facebookBotId: string | null;
}) => {
  const { t } = useTranslation('frontline');
  const { loadingDetail, facebookMessengerBot } =
    useFacebookBotForm(facebookBotId);

  if (loadingDetail) {
    return <Spinner />;
  }

  return (
    <>
      <Sheet.Header>
        <Sheet.Title className="capitalize">
          {facebookBotId ? t('edit') : t('add-new')} {t('facebook-bot')}
        </Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>

      <FbBotFormProvider facebookMessengerBot={facebookMessengerBot}>
        <AutomationFbBotFormContent />
      </FbBotFormProvider>
    </>
  );
};
