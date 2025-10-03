import { Button, ColorPicker, Form, Upload } from 'erxes-ui';
import {
  erxesMessengerSetupAppearanceAtom,
  erxesMessengerSetupStepAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { EMAPPEARANCE_SCHEMA } from '@/integrations/erxes-messenger/constants/emAppearanceSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  EMLayout,
  EMLayoutPreviousStepButton,
} from '@/integrations/erxes-messenger/components/EMLayout';
import { useSetAtom } from 'jotai';
import { EMFormValueEffectComponent } from '@/integrations/erxes-messenger/components/EMFormValueEffect';

export const EMAppearance = () => {
  const setStep = useSetAtom(erxesMessengerSetupStepAtom);
  const form = useForm<z.infer<typeof EMAPPEARANCE_SCHEMA>>({
    resolver: zodResolver(EMAPPEARANCE_SCHEMA),
    defaultValues: {
      color: '#000',
      textColor: '#fff',
      logo: '',
    },
  });

  const onSubmit = () => {
    setStep((prev) => prev + 1);
  };

  return (
    <Form {...form}>
      <EMFormValueEffectComponent
        form={form}
        atom={erxesMessengerSetupAppearanceAtom}
      />
      <form
        className="flex-auto flex flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <EMLayout
          title="Appearance"
          actions={
            <>
              <EMLayoutPreviousStepButton />
              <Button type="submit">Next step</Button>
            </>
          }
        >
          <div className="space-y-6 p-4 pt-0">
            <Form.Field
              name="color"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Brand color</Form.Label>
                  <Form.Control>
                    <ColorPicker
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      className="w-24"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="textColor"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Text color</Form.Label>
                  <Form.Control>
                    <ColorPicker
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      className="w-24"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              name="logo"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Logo</Form.Label>
                  <Form.Control>
                    <Upload.Root
                      value={field.value || ''}
                      onChange={(fileInfo) => {
                        if ('url' in fileInfo) {
                          field.onChange(fileInfo.url);
                        }
                      }}
                    >
                      <Upload.Preview />
                    </Upload.Root>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </EMLayout>
      </form>
    </Form>
  );
};
