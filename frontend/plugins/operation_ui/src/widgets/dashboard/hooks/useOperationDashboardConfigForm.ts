import { zodResolver } from '@hookform/resolvers/zod';
import { DefaultValues, FieldValues, useForm } from 'react-hook-form';
import type { TDashboardWidgetConfig } from 'ui-modules';
import { z } from 'zod';

/**
 * A tile's settings form, seeded from the stored config while it still
 * matches the schema, else from the defaults.
 */
export const useOperationDashboardConfigForm = <
  TSchema extends z.ZodType<FieldValues>,
>(
  schema: TSchema,
  config: TDashboardWidgetConfig | null | undefined,
  defaults: z.infer<TSchema>,
  onSubmit: (config: TDashboardWidgetConfig) => void,
) => {
  const parsed = schema.safeParse(config);

  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues: (parsed.success ? parsed.data : defaults) as DefaultValues<
      z.infer<TSchema>
    >,
  });

  return {
    form,
    submit: form.handleSubmit((values) => onSubmit(values)),
  };
};
