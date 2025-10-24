import { useForm } from 'react-hook-form';
import { TChannelMemberForm } from '../types';
import { zodResolver } from '@hookform/resolvers/zod';
import { CHANNEL_MEMBER_FORM_SCHEMA } from '../schema/member';

export const useChannelMembersForm = ({
  defaultValues,
}: {
  defaultValues?: TChannelMemberForm;
}) => {
  const form = useForm<TChannelMemberForm>({
    resolver: zodResolver(CHANNEL_MEMBER_FORM_SCHEMA),
    mode: 'onBlur',
    defaultValues: defaultValues || {
      memberIds: [],
    },
  });

  return form;
};
