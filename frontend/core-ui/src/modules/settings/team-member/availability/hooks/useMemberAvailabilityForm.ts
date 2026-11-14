import { zodResolver } from '@hookform/resolvers/zod';
import { useAtomValue } from 'jotai';
import { useForm } from 'react-hook-form';
import { currentUserState, usePermissionCheck } from 'ui-modules';
import { z } from 'zod';
import { IMemberAvailability } from '../types';
import { useSetMemberAvailability } from './useSetMemberAvailability';

export const memberAvailabilityFormSchema = z
  .object({
    status: z.enum(['unset', 'available', 'unavailable']),
    until: z.string().optional(),
    reason: z.string().max(200).optional(),
  })
  .refine((value) => !value.until || new Date(value.until) > new Date(), {
    path: ['until'],
    message: 'Pick a time in the future',
  });

export type TMemberAvailabilityForm = z.infer<
  typeof memberAvailabilityFormSchema
>;

// `datetime-local` wants local time without a zone.
const toLocalInput = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

/** Members set their own; others need the permission. */
export const useCanSetAvailability = (userId: string) => {
  const currentUser = useAtomValue(currentUserState);
  const { hasActionPermission } = usePermissionCheck();

  return (
    currentUser?._id === userId ||
    hasActionPermission('teamMembersSetAvailability')
  );
};

export const useMemberAvailabilityForm = (
  userId: string,
  availability?: IMemberAvailability | null,
  onDone?: () => void,
) => {
  const { setAvailability, loading } = useSetMemberAvailability();
  const form = useForm<TMemberAvailabilityForm>({
    resolver: zodResolver(memberAvailabilityFormSchema),
    defaultValues: {
      status: availability?.declaredStatus || 'unset',
      until: toLocalInput(availability?.declaredUntil),
      reason: availability?.declaredReason || '',
    },
  });

  const onSubmit = form.handleSubmit(({ status, until, reason }) =>
    setAvailability(
      {
        _id: userId,
        status: status === 'unset' ? null : status,
        until: status !== 'unset' && until ? new Date(until).toISOString() : null,
        reason: status !== 'unset' ? reason || null : null,
      },
      onDone,
    ),
  );

  return { form, onSubmit, loading };
};
