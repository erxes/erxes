import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { TTeamForm } from '@/team/types';
import { TEAM_FORM_SCHEMA } from '@/team/schemas';

export const useTeamForm = ({
  defaultValues,
}: {
  defaultValues?: TTeamForm;
}) => {
  const form = useForm<TTeamForm>({
    mode: 'onBlur',
    defaultValues: defaultValues || {
      name: '',
      description: '',
      icon: 'IconBuildingSkyscraper',
    },
    resolver: zodResolver(TEAM_FORM_SCHEMA),
  });

  return form;
};
