import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLoyaltyAccountFreeze } from './useLoyaltyAccountFreeze';

const freezeAccountSchema = z.object({
  reason: z.string().trim().min(1, 'A reason is required'),
});

type TFreezeAccountValues = z.infer<typeof freezeAccountSchema>;

export const useFreezeAccountForm = ({
  accountId,
  open,
  onDone,
}: {
  accountId: string;
  open: boolean;
  onDone: () => void;
}) => {
  const form = useForm<TFreezeAccountValues>({
    resolver: zodResolver(freezeAccountSchema),
    defaultValues: { reason: '' },
  });
  const { freeze, loading } = useLoyaltyAccountFreeze();

  useEffect(() => {
    if (open) {
      form.reset({ reason: '' });
    }
  }, [open, form]);

  const onSubmit = form.handleSubmit(({ reason }) =>
    freeze(accountId, reason, onDone),
  );

  return { form, onSubmit, loading };
};
