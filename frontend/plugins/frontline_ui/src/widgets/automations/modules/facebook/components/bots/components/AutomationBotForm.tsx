import { Empty, Spinner } from 'erxes-ui';
import { RecordSidePanel } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { AutomationFbBotFormContent } from '~/widgets/automations/modules/facebook/components/bots/components/AutomationFbBotFormContent';
import { FacebookBotCreateAutomationButton } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotCreateAutomationButton';
import { FacebookBotFormBody } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotFormBody';
import { useFacebookBotForm } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotForm';
import { FbBotFormProvider } from '../context/FbBotFormContext';

export const AutomationBotForm = ({
  facebookBotId,
  onClose,
}: Readonly<{
  facebookBotId: string | null;
  onClose: () => void;
}>) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.facebook' });
  const { loadingDetail, facebookMessengerBot } =
    useFacebookBotForm(facebookBotId);

  const header = (
    <RecordSidePanel.Header
      title={
        <span className="capitalize">
          {facebookBotId ? t('edit', 'Edit') : t('add-new', 'Add new')}{' '}
          {t('facebook-bot', 'Facebook bot')}
        </span>
      }
      actions={<FacebookBotCreateAutomationButton bot={facebookMessengerBot} />}
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
  if (facebookBotId && facebookMessengerBot?._id !== facebookBotId) {
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

  // A saved bot already names its page, so it gets the same surface the
  // integration opens. Creating one still needs the account and page steps.
  const page = facebookMessengerBot?.pageId
    ? {
        accountId: facebookMessengerBot.accountId ?? '',
        pageId: facebookMessengerBot.pageId,
      }
    : undefined;

  return (
    <>
      {header}

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
