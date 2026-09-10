import { Sheet, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AutomationFbBotFormContent } from '~/widgets/automations/modules/facebook/components/bots/components/AutomationFbBotFormContent';
import { FacebookBotCreateAutomationButton } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotCreateAutomationButton';
import { FacebookBotFormBody } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotFormBody';
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

  // A saved bot already names its page, so it gets the same surface the
  // integration opens. Creating one still needs the account and page steps.
  const page = facebookMessengerBot?.pageId
    ? {
        accountId: facebookMessengerBot.accountId,
        pageId: facebookMessengerBot.pageId,
      }
    : undefined;

  return (
    <>
      <Sheet.Header className="justify-between">
        <Sheet.Title className="capitalize">
          {facebookBotId ? t('edit') : t('add-new')} {t('facebook-bot')}
        </Sheet.Title>
        <div className="flex items-center gap-2">
          <FacebookBotCreateAutomationButton bot={facebookMessengerBot} />
          <Sheet.Close />
        </div>
      </Sheet.Header>

      {page ? (
        <FacebookBotFormBody facebookBotId={facebookBotId} page={page} />
      ) : (
        <FbBotFormProvider facebookMessengerBot={facebookMessengerBot}>
          <AutomationFbBotFormContent />
        </FbBotFormProvider>
      )}
    </>
  );
};
