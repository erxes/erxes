import { formSetupGeneralAtom } from '../states/formSetupStates';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FORM_GENERAL_SCHEMA } from '../constants/formSchema';
import { FormMutateLayout } from './FormMutateLayout';
import { ColorPicker, Form, Input, Textarea, ToggleGroup } from 'erxes-ui';
import { FormValueEffectComponent } from './FormValueEffectComponent';
import { SelectChannel } from '@/inbox/channel/components/SelectChannel';

export const FormGeneral = () => {
  const form = useForm<z.infer<typeof FORM_GENERAL_SCHEMA>>({
    resolver: zodResolver(FORM_GENERAL_SCHEMA),
    defaultValues: {
      primaryColor: '',
      appearance: 'iframe',
      title: 'title',
      description: '',
      channelId: '',
      buttonText: 'Submit',
    },
  });

  const onSubmit = (values: z.infer<typeof FORM_GENERAL_SCHEMA>) => null;

  return (
    <FormMutateLayout
      title="General"
      description="General settings"
      form={form}
      onSubmit={onSubmit}
    >
      <FormValueEffectComponent form={form} atom={formSetupGeneralAtom} />
      <div className="px-5 space-y-5">
        <Form.Field
          name="title"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Title</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="description"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Description</Form.Label>
              <Form.Control>
                <Textarea {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
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
        <Form.Field
          name="buttonText"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Button text</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          name="channelId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Channel</Form.Label>
              <SelectChannel.FormItem
                value={field.value}
                mode="single"
                onValueChange={field.onChange}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
    </FormMutateLayout>
  );
};
