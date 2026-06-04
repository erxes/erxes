import { Button, ColorPicker, Form, ToggleGroup, Upload } from 'erxes-ui';
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
      primary: {
        DEFAULT: '#5048e5',
        foreground: '#fff',
      },
      navigationVariant: 'pill',
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
              name="primary.DEFAULT"
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
              name="primary.foreground"
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
                      <Upload.RemoveButton
                        size="sm"
                        variant="outline"
                        type="button"
                      />
                    </Upload.Root>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="navigationVariant"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Navigation bar type</Form.Label>
                  <Form.Control>
                    <ToggleGroup
                      type="single"
                      variant={'outline'}
                      value={field.value}
                      className='max-w-32'
                      onValueChange={field.onChange}
                    >
                      <ToggleGroup.Item className="flex-auto" value="pill">
                        Pill
                      </ToggleGroup.Item>
                      <ToggleGroup.Item className="flex-auto" value="fluid">
                        Fluid
                      </ToggleGroup.Item>
                    </ToggleGroup>
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>
        </EMLayout>
      </form>
    </Form>
  );
};
