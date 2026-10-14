import { DirectMailOnboarding } from '@/integrations/mail/composer/components/DirectMailOnboarding';
import { ComposerWindow } from '@/integrations/mail/composer/components/DirectMailComposerWindow';
import { DirectMailComposerContext } from '@/integrations/mail/composer/contexts/DirectMailComposerContext';
import { useDirectMailComposer } from '@/integrations/mail/composer/hooks/useDirectMailComposer';
import { Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const DirectMailComposerContent = () => {
  const composer = useDirectMailComposer();
  const { t } = useTranslation('frontline');
  if (!composer.target || !composer.canComposeEmail) return null;
  const hasDraft = Boolean(
    composer.form.getValues('subject').trim() ||
      composer.form.getValues('body').trim() ||
      composer.attachments.length ||
      composer.failedDelivery,
  );
  if (composer.sendersLoading && !hasDraft) {
    return (
      <div
        aria-busy="true"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg border bg-background px-4 py-3 text-sm shadow-sm"
      >
        <Spinner size="sm" containerClassName="h-4 w-4 flex-none" />
        <output>
          {t('mail-onboarding-checking', 'Checking email setup…')}
        </output>
      </div>
    );
  }
  if (
    !composer.sendersLoading &&
    !composer.sendersError &&
    !composer.senders.length &&
    !hasDraft
  ) {
    return <DirectMailOnboarding onClose={composer.close} />;
  }
  return (
    <DirectMailComposerContext.Provider value={composer}>
      <ComposerWindow />
    </DirectMailComposerContext.Provider>
  );
};
