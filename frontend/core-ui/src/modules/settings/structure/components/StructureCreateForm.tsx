import { type ComponentProps, type ReactNode } from 'react';
import {
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form';
import { Form } from 'erxes-ui';
import { PanelFormLayout } from 'ui-modules';

export const StructureCreateForm = <TValues extends FieldValues>({
  methods,
  onSubmit,
  header,
  children,
  ...layout
}: ComponentProps<typeof PanelFormLayout> & {
  methods: UseFormReturn<TValues>;
  onSubmit: SubmitHandler<TValues>;
  header: ReactNode;
}) => (
  <Form {...methods}>
    <form
      className="flex flex-col gap-0 size-full"
      onSubmit={methods.handleSubmit(onSubmit)}
    >
      {header}
      <PanelFormLayout {...layout}>{children}</PanelFormLayout>
    </form>
  </Form>
);
