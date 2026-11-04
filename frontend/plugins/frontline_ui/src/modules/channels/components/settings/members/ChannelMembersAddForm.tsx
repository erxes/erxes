import { usePanelFormDraft } from '@/shared/hooks/usePanelFormDraft';
import { channelMembersPanelDraftsState } from '@/channels/states';
import { MemberForm } from './MemberForm';
import { useChannelMembersAdd } from '@/channels/hooks/useChannelMembersAdd';
import { useChannelMembersForm } from '@/channels/hooks/useChannelMembersForm';
import { TChannelMemberForm } from '@/channels/types';
import { SettingsPanelFooter } from '@/settings/components/SettingsPanelForm';
import { Form, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';

/** Adds selected members to the channel shown in the settings panel. */
export const ChannelMembersAddForm = ({ channelId }: { channelId: string }) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { toast } = useToast();
  const { close } = useSidePanel();
  const values: TChannelMemberForm = { memberIds: [] };
  const form = useChannelMembersForm({ defaultValues: values });
  const { clearDraft, markSaved, isActive, beginSave, endSave, saving } =
    usePanelFormDraft({
      form,
      recordKey: channelId,
      values,
      draftsState: channelMembersPanelDraftsState,
    });
  /** Discards the retained member selection and closes its panel. */
  const cancel = () => {
    clearDraft();
    close();
  };
  const { channelAddMembers, loading } = useChannelMembersAdd();
  /** Saves the member selection and reports the mutation result. */
  const onSubmit = (values: TChannelMemberForm) => {
    const saveId = beginSave();
    if (saveId === undefined) return undefined;
    const submittedValues = structuredClone(form.getValues());
    return channelAddMembers({
      variables: { id: channelId, memberIds: values.memberIds ?? [] },
      onCompleted: () => {
        toast({ title: t('success', 'Success!') });
        endSave(saveId);
        if (markSaved(values, submittedValues) && isActive()) close();
      },
      onError: (error) => {
        endSave(saveId);
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        });
      },
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
          onCancel={cancel}
          cancelLabel={t('cancel', 'Cancel')}
          submitLabel={t('add', 'Add')}
          loading={loading || saving}
        />
      </form>
    </Form>
  );
};
