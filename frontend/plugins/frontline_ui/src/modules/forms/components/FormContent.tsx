import { formSetupContentAtom } from '../states/formSetupStates';
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
      title: '',
      description: '',
      buttonText: '',
      steps: {
        '1': {
          order: 1,
          fields: [],
        },
      },
    },
  });

  const onSubmit = (values: z.infer<typeof FORM_CONTENT_SCHEMA>) => {
    console.log(values);
  };

  return (
    <FormMutateLayout
      title="Content"
      description="Content"
      form={form}
      onSubmit={onSubmit}
    >
      <FormValueEffectComponent form={form} atom={formSetupContentAtom} />
      <InfoCard title="Fields">
        <Form.Field
          control={form.control}
          name="steps"
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
