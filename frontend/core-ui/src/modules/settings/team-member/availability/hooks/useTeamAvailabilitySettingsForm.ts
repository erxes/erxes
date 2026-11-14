import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTeamAvailabilitySettings } from './useTeamAvailabilitySettings';

const teamAvailabilitySettingsSchema = z.object({
  segmentId: z.string().optional(),
  precedence: z.enum(['segment', 'manual']),
});

export type TTeamAvailabilitySettingsForm = z.infer<
  typeof teamAvailabilitySettingsSchema
>;

export const useTeamAvailabilitySettingsForm = (onDone?: () => void) => {
  const { settings, loading, save, saving } = useTeamAvailabilitySettings();
  const form = useForm<TTeamAvailabilitySettingsForm>({
    resolver: zodResolver(teamAvailabilitySettingsSchema),
    defaultValues: { segmentId: '', precedence: 'segment' },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        segmentId: settings.segmentId || '',
        precedence: settings.precedence === 'manual' ? 'manual' : 'segment',
      });
    }
  }, [settings, form]);

  const onSubmit = form.handleSubmit(({ segmentId, precedence }) =>
    save({ segmentId: segmentId || null, precedence }, onDone),
  );

  return { form, onSubmit, loading, saving };
};
