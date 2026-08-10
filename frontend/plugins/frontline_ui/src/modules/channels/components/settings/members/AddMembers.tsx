import { MemberForm } from '@/channels/components/settings/members/MemberForm';
import { useChannelMembersAdd } from '@/channels/hooks/useChannelMembersAdd';
import { useChannelMembersForm } from '@/channels/hooks/useChannelMembersForm';
import { ChannelHotKeyScope, TChannelMemberForm } from '@/channels/types';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  Dialog,
  Form,
  Kbd,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
  useToast,
} from 'erxes-ui';
import React, { useState } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const AddMembers = () => {
  const { t } = useTranslation('frontline');
  const form = useChannelMembersForm({});
  const { id } = useParams();
  const { toast } = useToast();
  const { channelAddMembers, loading } = useChannelMembersAdd();
  const [_open, _setOpen] = useState(false);
  const setHotkeyScope = useSetHotkeyScope();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = (open: boolean) => {
    _setOpen(open);
    setHotkeyScopeAndMemorizePreviousScope(ChannelHotKeyScope.ChannelAddSheet);
  };

  const onClose = () => {
    setHotkeyScope(ChannelHotKeyScope.ChannelSettingsPage);
    _setOpen(false);
  };
  useScopedHotkeys(
    `c`,
    () => onOpen(true),
    ChannelHotKeyScope.ChannelSettingsPage,
  );
  useScopedHotkeys(`esc`, () => onClose(), ChannelHotKeyScope.ChannelAddSheet);

  const submitHandler: SubmitHandler<TChannelMemberForm> = React.useCallback(
    async (data) => {
      channelAddMembers({
        variables: { ...data, id },
        onCompleted: () => {
          toast({ title: t('success') });
          form.reset();
          _setOpen(false);
        },
        onError: (error) =>
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          }),
      });
    },
    [channelAddMembers, toast, _setOpen, form],
  );

  return (
    <Dialog open={_open} onOpenChange={onOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add-members')}
          <Kbd>C</Kbd>
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header className="flex-row">
          <Dialog.Title className="flex items-center gap-2">
            {t('add-members')}
          </Dialog.Title>
        </Dialog.Header>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitHandler)}
            className="flex flex-col size-full gap-5"
          >
            <MemberForm form={form} />
            <Button className="w-full" type="submit" disabled={loading}>
              {t('add')}
            </Button>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};
