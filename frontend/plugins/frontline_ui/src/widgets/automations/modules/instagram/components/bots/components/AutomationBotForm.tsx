import { Empty, Spinner } from 'erxes-ui';
import { RecordSidePanel } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { AutomationIgBotFormContent } from '~/widgets/automations/modules/instagram/components/bots/components/AutomationIgBotFormContent';
import { InstagramBotCreateAutomationButton } from '~/widgets/automations/modules/instagram/components/bots/components/InstagramBotCreateAutomationButton';
import { useInstagramBotForm } from '~/widgets/automations/modules/instagram/components/bots/hooks/useInstagramBotForm';
import { IgBotFormProvider } from '../context/IgBotFormContext';

export const AutomationBotForm = ({
  instagramBotId,
  onClose,
}: Readonly<{
  instagramBotId: string | null;
  onClose: () => void;
}>) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.instagram' });
  const { loadingDetail, instagramMessengerBot } =
    useInstagramBotForm(instagramBotId);

  const header = (
    <RecordSidePanel.Header
      title={
        <span className="capitalize">
          {instagramBotId ? t('edit', 'Edit') : t('add-new', 'Add new')}{' '}
          {t('instagram-bot', 'Instagram bot')}
        </span>
      }
      actions={
        <InstagramBotCreateAutomationButton bot={instagramMessengerBot} />
      }
      onClose={onClose}
    />
  );
  if (loadingDetail) {
    return (
      <>
        {header}
        <Spinner />
      </>
    );
  }
  if (instagramBotId && instagramMessengerBot?._id !== instagramBotId) {
    return (
      <>
        {header}
        <Empty>
          <Empty.Header>
            <Empty.Title>{t('not-found', 'Bot unavailable')}</Empty.Title>
          </Empty.Header>
        </Empty>
      </>
    );
  }

  return (
    <>
      {header}

      <IgBotFormProvider instagramMessengerBot={instagramMessengerBot}>
        <AutomationIgBotFormContent />
      </IgBotFormProvider>
    </>
  );
};
