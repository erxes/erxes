import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { TEAM_MEMBER_FORM_SCHEMA } from '@/team/schemas';
import { TTeamMemberForm } from '@/team/types';

export const useAddMemberForm = ({
  defaultValues,
}: {
  defaultValues?: TTeamMemberForm;
}) => {
  const form = useForm<TTeamMemberForm>({
    mode: 'onBlur',
    defaultValues: defaultValues || {
      memberIds: [],
    },
    resolver: zodResolver(TEAM_MEMBER_FORM_SCHEMA),
  });

  return form;
};
