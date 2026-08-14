import { differenceInHours } from 'date-fns';
import { useFacebookConversationMessages } from '../hooks/useFacebookConversationMessages';
import { Button, Dialog, Form, Select, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import { messageExtraInfoState } from '@/inbox/conversations/conversation-detail/states/messageExtraInfoState';
import { EnumFacebookTag } from '@/integrations/facebook/types/FacebookTypes';
import {
  useForm,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FACEBOOK_TAG_FORM_SCHEMA } from '../constants/FbTagSchema';
import { z } from 'zod';
import { FACEBOOK_MESSAGE_WINDOW_HOURS } from '@/integrations/facebook/constants/FbMessageWindow';

type FacebookTagFormValues = z.infer<typeof FACEBOOK_TAG_FORM_SCHEMA>;

const FacebookTagSelect = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <Select value={value} onValueChange={onValueChange}>
      <Form.Control>
        <Select.Trigger>
          <Select.Value placeholder={t('select-tag')} />
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        <Select.Item value={EnumFacebookTag.CONFIRMED_EVENT_UPDATE}>
          {t('confirmed-event-update')}
        </Select.Item>
        <Select.Item value={EnumFacebookTag.POST_PURCHASE_UPDATE}>
          {t('post-purchase-update')}
        </Select.Item>
        <Select.Item value={EnumFacebookTag.ACCOUNT_UPDATE}>
          {t('account-update')}
        </Select.Item>
      </Select.Content>
    </Select>
  );
};

const FacebookTagField = ({
  form,
}: {
  form: UseFormReturn<FacebookTagFormValues>;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <Form.Field
      control={form.control}
      name="tag"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('tag')}</Form.Label>
          <FacebookTagSelect
            value={field.value}
            onValueChange={field.onChange}
          />
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

const FacebookTagDialogForm = ({
  form,
  onSubmit,
}: {
  form: UseFormReturn<FacebookTagFormValues>;
  onSubmit: SubmitHandler<FacebookTagFormValues>;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FacebookTagField form={form} />
        <Dialog.Footer>
          <Button type="submit">{t('submit')}</Button>
        </Dialog.Footer>
      </form>
    </Form>
  );
};

export const FacebookTaggingForm = () => {
  const { t } = useTranslation('frontline');
  const setExtraInfo = useSetAtom(messageExtraInfoState);
  const form = useForm<FacebookTagFormValues>({
    resolver: zodResolver(FACEBOOK_TAG_FORM_SCHEMA),
    defaultValues: {
      tag: EnumFacebookTag.CONFIRMED_EVENT_UPDATE,
    },
  });

  const onSubmit: SubmitHandler<FacebookTagFormValues> = (data) => {
    setExtraInfo((prev) => ({ ...prev, tag: data.tag }));
  };

  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button type="button" size="sm" variant="secondary">
          {t('select-tag')}
        </Button>
      </Dialog.Trigger>
      <Dialog.ContentCombined
        title={t('select-tag')}
        description={t('fb-24h-window-description')}
        className="sm:max-w-sm"
      >
        <p className="text-sm text-muted-foreground">
          {t('fb-24h-window-description')}
        </p>
        <FacebookTagDialogForm form={form} onSubmit={onSubmit} />
      </Dialog.ContentCombined>
    </Dialog>
  );
};

export const FacebookMessageInputWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { t } = useTranslation('frontline');
  const { facebookConversationMessages, loading } =
    useFacebookConversationMessages();

  const extraInfo = useAtomValue(messageExtraInfoState);

  const { createdAt: lastMessageDate } =
    facebookConversationMessages?.[facebookConversationMessages?.length - 1] ||
    {};

  if (loading) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center p-4">
        <Skeleton className="h-24 w-full max-w-lg rounded-lg" />
      </div>
    );
  }

  const isNotIn24Hours =
    differenceInHours(new Date(), new Date(lastMessageDate || '')) >
    FACEBOOK_MESSAGE_WINDOW_HOURS;

  if (lastMessageDate && isNotIn24Hours && !extraInfo?.tag) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center overflow-hidden p-4">
        <div className="flex max-w-lg flex-col items-center gap-2 text-center">
          <p className="text-sm font-medium text-foreground">
            {t('fb-24h-window-title')}
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            {t('fb-24h-window-description')}
          </p>
          <div className="pt-1">
            <FacebookTaggingForm />
          </div>
        </div>
      </div>
    );
  }

  return children;
};
