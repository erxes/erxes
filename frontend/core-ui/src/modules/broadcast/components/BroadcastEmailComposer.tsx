import { useBroadcastAdd } from '@/broadcast/hooks/useBroadcastAdd';
import { useBroadcastForm } from '@/broadcast/hooks/useBroadcastForm';
import { IBroadcastMethodEnum } from '@/broadcast/types';
import { EmailSenderScopeProvider } from '@/settings/mail-config/contexts/EmailSenderScope';
import {
  Button,
  Separator,
  Sheet,
  useRemoveQueryStateByKey,
  useToast,
} from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { prepareBroadcastVariables } from '../utils/prepareBroadcastVariables';
import { BroadcastComposerSettings } from './BroadcastComposerSettings';
import { BroadcastCopyHtmlButton } from './BroadcastCopyHtmlButton';
import { BroadcastFromField } from './BroadcastFromField';
import { BroadcastPreviewEmailDialog } from './BroadcastPreviewEmailDialog';
import { BroadcastPreviewTextField } from './BroadcastPreviewTextField';
import { BroadcastSaveAsTemplate } from './BroadcastSaveAsTemplate';
import { BroadcastSendTestEmail } from './BroadcastSendTestEmail';
import { BroadcastSubjectField } from './BroadcastSubjectField';
import { BroadcastTargetPopover } from './BroadcastTargetPopover';
import { BroadcastTitleInput } from './BroadcastTitleInput';
import { BroadcastEmailPreview } from './preview/BroadcastEmailPreview';

const VALIDATE_FIELDS = [
  'title',
  'targetType',
  'targetIds',
  'fromEmail',
  'email.subject',
  'email.replyTo',
  'email.contentJson',
];

export const BroadcastEmailComposer = ({
  setOpen,
}: {
  setOpen: (open: boolean) => void;
}) => {
  const removeQueryStateByKey = useRemoveQueryStateByKey();
  const { toast } = useToast();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });

  const { form } = useBroadcastForm();
  const { addBroadcast } = useBroadcastAdd();

  const handleClose = () => {
    setOpen(false);
    removeQueryStateByKey('method');
  };

  const onSubmit = (data: any, action: 'draft' | 'live') => {
    addBroadcast({
      variables: prepareBroadcastVariables(
        data,
        IBroadcastMethodEnum.EMAIL,
        action,
      ),
      onCompleted: () => {
        toast({
          variant: 'default',
          title:
            action === 'draft'
              ? 'Broadcast saved as draft'
              : 'Broadcast created',
        });
        handleClose();
      },
    });
  };

  const handleSave = async (action: 'draft' | 'live') => {
    const isValid = await form.trigger(VALIDATE_FIELDS as any);

    if (!isValid) {
      return;
    }

    form.handleSubmit((data) => onSubmit(data, action))();
  };

  return (
    <FormProvider {...form}>
      <EmailSenderScopeProvider scope="broadcast">
        <Sheet.Header className="px-8">
          <BroadcastTitleInput />
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-8 py-3">
            <BroadcastComposerSettings />
            <BroadcastPreviewEmailDialog />
            <BroadcastCopyHtmlButton />
            <BroadcastSendTestEmail variant="ghost" />
          </div>

          <Separator />

          <div className="flex flex-col gap-5 px-8 py-6">
            <BroadcastSubjectField />
            <BroadcastFromField />
            <BroadcastTargetPopover />
          </div>

          <Separator />

          <div className="px-8 py-4">
            <BroadcastPreviewTextField />
          </div>

          <Separator />

          <div className="flex-1 min-h-0 overflow-hidden px-8 py-4">
            <BroadcastEmailPreview />
          </div>
        </Sheet.Content>

        <Sheet.Footer className="px-8">
          <Button onClick={handleClose} variant="secondary" type="button">
            {t('cancel')}
          </Button>
          <BroadcastSaveAsTemplate />
          <Button onClick={() => handleSave('draft')} type="button">
            {t('saveDraft')}
          </Button>
          <Button onClick={() => handleSave('live')} type="button">
            {t('saveLive')}
          </Button>
        </Sheet.Footer>
      </EmailSenderScopeProvider>
    </FormProvider>
  );
};
