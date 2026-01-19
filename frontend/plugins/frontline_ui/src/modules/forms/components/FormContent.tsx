import {
  formSetupContentAtom,
  formSetupStepAtom,
} from '../states/formSetupStates';
import { FormMutateLayout } from './FormMutateLayout';
import { FORM_CONTENT_SCHEMA } from '../constants/formSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, InfoCard } from 'erxes-ui';
import { FormValueEffectComponent } from './FormValueEffectComponent';
import { FormDnd } from './FormDnd';
import { FormDndProvider } from './FormDndProvider';

export const FormContent = () => {
  const form = useForm<z.infer<typeof FORM_CONTENT_SCHEMA>>({
    resolver: zodResolver(FORM_CONTENT_SCHEMA),
    defaultValues: {
      steps: {
        initial: {
          order: 1,
          name: 'Initial',
          fields: [],
        },
      },
    },
  });

  return (
    <FormMutateLayout title="Content" description="Content" form={form}>
      <FormValueEffectComponent form={form} atom={formSetupContentAtom} />
      <InfoCard title="Fields">
        <Form.Field
          name="steps"
          control={form.control}
          render={({ field }) => (
            <FormDndProvider value={field.value} onValueChange={field.onChange}>
              <FormDnd />
            </FormDndProvider>
          )}
        />
      </InfoCard>
    </FormMutateLayout>
  );
};
