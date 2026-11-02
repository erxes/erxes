import { MemberForm } from './MemberForm';
import { useChannelMembersAdd } from '@/channels/hooks/useChannelMembersAdd';
import { useChannelMembersForm } from '@/channels/hooks/useChannelMembersForm';
import { TChannelMemberForm } from '@/channels/types';
import { SettingsPanelFooter } from '@/settings/components/SettingsPanelForm';
import { Form, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';

export const ChannelMembersAddForm = ({ channelId }: { channelId: string }) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { toast } = useToast();
  const { close } = useSidePanel();
  const form = useChannelMembersForm({});
  const { channelAddMembers, loading } = useChannelMembersAdd();
  const onSubmit = (values: TChannelMemberForm) => {
    channelAddMembers({
      variables: { id: channelId, memberIds: values.memberIds ?? [] },
      onCompleted: () => {
        toast({ title: t('success', 'Success!') });
        form.reset();
        close();
      },
      onError: (error) =>
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        }),
    });
  };
  return (
    <Form {...form}>
      <form
        className="flex flex-1 min-h-0 flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-3">
          <MemberForm form={form} channelId={channelId} />
        </div>
        <SettingsPanelFooter
          onCancel={close}
          cancelLabel={t('cancel', 'Cancel')}
          submitLabel={t('add', 'Add')}
          loading={loading}
        />
      </form>
    </Form>
  );
};
