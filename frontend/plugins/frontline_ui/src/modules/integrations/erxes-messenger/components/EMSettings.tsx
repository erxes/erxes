import { Button, Form, LanguageSelect, Switch } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { EM_SETTINGS_SCHEMA } from '../constants/emSettingsSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  EMLayout,
  EMLayoutPreviousStepButton,
} from '@/integrations/erxes-messenger/components/EMLayout';
import { useSetAtom } from 'jotai';
import {
  erxesMessengerSetupSettingsAtom,
  erxesMessengerSetupStepAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMFormValueEffectComponent } from '@/integrations/erxes-messenger/components/EMFormValueEffect';

type EMSettingsFormValues = z.infer<typeof EM_SETTINGS_SCHEMA>;

export const EMSettings = () => {
  const form = useForm<EMSettingsFormValues>({
    resolver: zodResolver(EM_SETTINGS_SCHEMA),
    defaultValues: {
      languageCode: 'en-US',
      requireAuth: false,
      showChat: true,
      showLauncher: true,
      forceLogoutWhenResolve: false,
      notifyCustomer: false,
      showVideoCallRequest: false,
    },
  });

  const setSettings = useSetAtom(erxesMessengerSetupSettingsAtom);
  const setStep = useSetAtom(erxesMessengerSetupStepAtom);

  const onSubmit = (data: EMSettingsFormValues) => {
    setSettings(data);
    setStep((prev) => prev + 1);
  };

  return (
    <Form {...form}>
      <EMFormValueEffectComponent
        form={form}
        atom={erxesMessengerSetupSettingsAtom}
      />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex-auto flex flex-col overflow-hidden"
      >
        <EMLayout
          title="Settings"
          actions={
            <>
              <EMLayoutPreviousStepButton />
              <Button type="submit">Next step</Button>
            </>
          }
        >
          <div className="p-4 pt-0 space-y-6 overflow-auto styled-scroll flex-1">
            <Form.Field
              name="languageCode"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Default language</Form.Label>
                  <Form.Control>
                    <LanguageSelect
                      value={field.value}
                      onValueChange={field.onChange}
                      className="max-w-96"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="requireAuth"
              render={({ field }) => (
                <Form.Item>
                  <div className="flex items-center gap-3">
                    <Form.Control>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>

                    <Form.Label variant="peer" className="leading-6">
                      Require Authentication
                    </Form.Label>
                  </div>
                  <Form.Description>
                    It will require email and phone in widget
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="showChat"
              render={({ field }) => (
                <Form.Item>
                  <div className="flex items-center gap-3">
                    <Form.Control>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>

                    <Form.Label variant="peer" className="leading-6">
                      Show chat
                    </Form.Label>
                  </div>
                  <Form.Description>
                    Hide chat section and show only knowledgebase and form
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="showLauncher"
              render={({ field }) => (
                <Form.Item>
                  <div className="flex items-center gap-3">
                    <Form.Control>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>

                    <Form.Label variant="peer" className="leading-6">
                      Show launcher
                    </Form.Label>
                  </div>
                  <Form.Description>
                    The widget section will invisible but you can still get
                    messenger data
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="forceLogoutWhenResolve"
              render={({ field }) => (
                <Form.Item>
                  <div className="flex items-center gap-3">
                    <Form.Control>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>

                    <Form.Label variant="peer" className="leading-6">
                      Force logout
                    </Form.Label>
                  </div>
                  <Form.Description>
                    If an operator resolve the conversation from inbox then
                    client session will end automatically
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="notifyCustomer"
              render={({ field }) => (
                <Form.Item>
                  <div className="flex items-center gap-3">
                    <Form.Control>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>

                    <Form.Label variant="peer" className="leading-6">
                      Notify customer
                    </Form.Label>
                  </div>
                  <Form.Description>
                    If customer is offline and inserted email, it will send
                    email when operator respond
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="showVideoCallRequest"
              render={({ field }) => (
                <Form.Item>
                  <div className="flex items-center gap-3">
                    <Form.Control>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>

                    <Form.Label variant="peer" className="leading-6">
                      Show video call request
                    </Form.Label>
                  </div>
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
