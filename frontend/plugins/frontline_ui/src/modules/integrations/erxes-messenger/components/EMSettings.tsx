import {
  Button,
  Collapsible,
  Form,
  Input,
  LanguageSelect,
  Switch,
} from 'erxes-ui';
import { useFieldArray, useForm } from 'react-hook-form';
import { EM_SETTINGS_SCHEMA } from '../constants/emSettingsSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import {
  EMLayout,
  EMLayoutPreviousStepButton,
} from '@/integrations/erxes-messenger/components/EMLayout';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  erxesMessengerSetupSettingsAtom,
  erxesMessengerSetupStepAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMFormValueEffectComponent } from '@/integrations/erxes-messenger/components/EMFormValueEffect';

type EMSettingsFormValues = z.infer<typeof EM_SETTINGS_SCHEMA>;

export const EMSettings = () => {
  const atomValue = useAtomValue(erxesMessengerSetupSettingsAtom);
  const form = useForm<EMSettingsFormValues>({
    resolver: zodResolver(EM_SETTINGS_SCHEMA),
    defaultValues: atomValue ?? {
      languageCode: 'en-US',
      requireAuth: false,
      showChat: true,
      showLauncher: true,
      forceLogoutWhenResolve: false,
      notifyCustomer: false,
      showVideoCallRequest: false,
      websiteApps: [],
    },
  });

  const {
    fields: websiteAppFields,
    append: appendWebsiteApp,
    remove: removeWebsiteApp,
  } = useFieldArray({ control: form.control, name: 'websiteApps' });

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
            <Collapsible>
              <Collapsible.TriggerButton>
                <Collapsible.TriggerIcon />
                Website apps
              </Collapsible.TriggerButton>
              <Collapsible.Content>
                <Form.Item>
                  <div className="space-y-4">
                    {websiteAppFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            App {index + 1}
                          </span>
                          <Button
                            variant="secondary"
                            onClick={() => removeWebsiteApp(index)}
                            className="size-8 hover:bg-destructive/30 bg-destructive/10 text-destructive"
                          >
                            <IconTrash />
                          </Button>
                        </div>
                        <Form.Field
                          name={`websiteApps.${index}.credentials.url`}
                          render={({ field }) => (
                            <Form.Item>
                              <Form.Label>URL</Form.Label>
                              <Form.Control>
                                <Input
                                  placeholder="https://example.com"
                                  {...field}
                                />
                              </Form.Control>
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                        <Form.Field
                          name={`websiteApps.${index}.credentials.description`}
                          render={({ field }) => (
                            <Form.Item>
                              <Form.Label>Description</Form.Label>
                              <Form.Control>
                                <Input
                                  placeholder="Optional description"
                                  {...field}
                                />
                              </Form.Control>
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                        <Form.Field
                          name={`websiteApps.${index}.credentials.buttonText`}
                          render={({ field }) => (
                            <Form.Item>
                              <Form.Label>Button text</Form.Label>
                              <Form.Control>
                                <Input
                                  placeholder="Optional button label"
                                  {...field}
                                />
                              </Form.Control>
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                        <Form.Field
                          name={`websiteApps.${index}.showInInbox`}
                          render={({ field }) => (
                            <Form.Item>
                              <div className="flex items-center gap-3">
                                <Form.Control>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </Form.Control>
                                <Form.Label
                                  variant="peer"
                                  className="leading-6"
                                >
                                  Show in inbox
                                </Form.Label>
                              </div>
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                      </div>
                    ))}
                    <Button
                      variant="secondary"
                      onClick={() =>
                        appendWebsiteApp({
                          kind: 'webstite',
                          showInInbox: false,
                          credentials: {
                            integrationId: '',
                            url: '',
                            description: '',
                            buttonText: '',
                          },
                          scopeBrandIds: [],
                        })
                      }
                    >
                      <IconPlus />
                      Add website app
                    </Button>
                  </div>
                </Form.Item>
              </Collapsible.Content>
            </Collapsible>
          </div>
        </EMLayout>
      </form>
    </Form>
  );
};
