import { usePosAdd } from '@/pos/hooks/usePosAdd';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from 'erxes-ui';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export interface PosFormData {
  name: string;
  description: string;
}

const DEFAULT_VALUES: PosFormData = { name: '', description: '' };

export const usePosCreateForm = (onCreated: (posId?: string) => void) => {
  const { t } = useTranslation('sales');
  const { toast } = useToast();
  const { posAdd, loading } = usePosAdd();

  const schema = useMemo(
    () =>
      z.object({
        name: z
          .string()
          .trim()
          .min(1, t('name-required'))
          .min(2, t('name-min-length')),
        description: z.string(),
      }),
    [t],
  );

  const form = useForm<PosFormData>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const { data: result } = await posAdd({
        variables: { name: data.name, description: data.description },
      });

      toast({ title: t('success'), description: t('pos-create-success') });
      form.reset(DEFAULT_VALUES);
      onCreated(result?.posAdd?._id ?? undefined);
    } catch (e) {
      toast({
        title: t('error'),
        description: e instanceof Error ? e.message : t('pos-create-failed'),
        variant: 'destructive',
      });
    }
  });

  return {
    form,
    onSubmit,
    submitting: loading,
    reset: () => form.reset(DEFAULT_VALUES),
  };
};
