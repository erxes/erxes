import { useAtom } from 'jotai';
import { formSetupAppearanceAtom } from '../states/formSetupStates';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FORM_APPEARENCE_SCHEMA } from '../constants/formSchema';
import { FormMutateLayout } from './FormMutateLayout';
import { ColorPicker, Form, ToggleGroup } from 'erxes-ui';
import { FormValueEffectComponent } from './FormValueEffectComponent';

export const FormAppearence = () => {
  const form = useForm<z.infer<typeof FORM_APPEARENCE_SCHEMA>>({
    resolver: zodResolver(FORM_APPEARENCE_SCHEMA),
    defaultValues: {
      primaryColor: '',
      appearance: 'iframe',
    },
  });

  const onSubmit = (values: z.infer<typeof FORM_APPEARENCE_SCHEMA>) => {
    console.log(values);
  };

  return (
    <FormMutateLayout
      title="Appearance"
      description="Appearance"
      form={form}
      onSubmit={onSubmit}
    >
      <FormValueEffectComponent form={form} atom={formSetupAppearanceAtom} />
      <div className="px-5 space-y-5">
        <Form.Field
          name="primaryColor"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Primary color</Form.Label>
              <div className="w-24">
                <Form.Control>
                  <ColorPicker
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                  />
                </Form.Control>
              </div>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="appearance"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Appearance</Form.Label>
              <Form.Control>
                <ToggleGroup
                  type="single"
                  value={field.value}
                  onValueChange={field.onChange}
                  variant="outline"
                  className="max-w-96"
                >
                  <ToggleGroup.Item value="iframe" className="flex-auto">
                    Iframe
                  </ToggleGroup.Item>
                  <ToggleGroup.Item value="messenger" className="flex-auto">
                    Messenger
                  </ToggleGroup.Item>
                </ToggleGroup>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </FormMutateLayout>
  );
};
