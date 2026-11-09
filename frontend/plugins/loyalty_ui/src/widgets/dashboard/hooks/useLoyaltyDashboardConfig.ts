import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { DefaultValues, FieldValues, useForm } from 'react-hook-form';
import { TDashboardWidgetConfig } from 'ui-modules';
import { z } from 'zod';

/** The stored config when it still matches the schema, else the defaults. */
export const useLoyaltyDashboardConfig = <TSchema extends z.ZodType<FieldValues>>(
  schema: TSchema,
  config: TDashboardWidgetConfig | null | undefined,
  defaults: z.infer<TSchema>,
): z.infer<TSchema> =>
  useMemo(() => {
    const parsed = schema.safeParse(config);
    return parsed.success ? parsed.data : defaults;
  }, [schema, config, defaults]);

/** A widget settings form seeded from the stored config. */
export const useLoyaltyDashboardConfigForm = <
  TSchema extends z.ZodType<FieldValues>,
>(
  schema: TSchema,
  config: TDashboardWidgetConfig | null | undefined,
  defaults: z.infer<TSchema>,
  onSubmit: (config: TDashboardWidgetConfig) => void,
) => {
  const initial = useLoyaltyDashboardConfig(schema, config, defaults);

  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues: initial as DefaultValues<z.infer<TSchema>>,
  });

  return {
    form,
    submit: form.handleSubmit((values) => onSubmit(values)),
  };
};
