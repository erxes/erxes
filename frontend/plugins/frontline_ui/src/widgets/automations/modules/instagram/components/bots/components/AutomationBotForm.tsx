import { Sheet, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AutomationIgBotFormContent } from '~/widgets/automations/modules/instagram/components/bots/components/AutomationIgBotFormContent';
import { InstagramBotCreateAutomationButton } from '~/widgets/automations/modules/instagram/components/bots/components/InstagramBotCreateAutomationButton';
import { useInstagramBotForm } from '~/widgets/automations/modules/instagram/components/bots/hooks/useInstagramBotForm';
import { IgBotFormProvider } from '../context/IgBotFormContext';

export const AutomationBotForm = ({
  instagramBotId,
}: {
  instagramBotId: string | null;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.instagram' });
  const { loadingDetail, instagramMessengerBot } =
    useInstagramBotForm(instagramBotId);

  if (loadingDetail) {
    return <Spinner />;
  }

  return (
    <>
      <Sheet.Header className="justify-between">
        <Sheet.Title className="capitalize">
          {instagramBotId ? t('edit', 'Edit') : t('add-new', 'Add new')}{' '}
          {t('instagram-bot', 'Instagram bot')}
        </Sheet.Title>
        <div className="flex items-center gap-2">
          <InstagramBotCreateAutomationButton bot={instagramMessengerBot} />
          <Sheet.Close />
        </div>
      </Sheet.Header>

      <IgBotFormProvider instagramMessengerBot={instagramMessengerBot}>
        <AutomationIgBotFormContent />
      </IgBotFormProvider>
    </>
  );
};
