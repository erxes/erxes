import { useFieldArray, useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EM_CONFIG_SCHEMA } from '@/integrations/erxes-messenger/constants/emConfigSchema';
import {
  Button,
  Collapsible,
  Form,
  Input,
  Select,
  Spinner,
  Switch,
  Textarea,
  Tooltip,
} from 'erxes-ui';
import {
  EMLayout,
  EMLayoutPreviousStepButton,
} from '@/integrations/erxes-messenger/components/EMLayout';
import { SelectMember } from 'ui-modules';
import { IconPlus, IconQuestionMark, IconTrash } from '@tabler/icons-react';
import { erxesMessengerSetupConfigAtom } from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMFormValueEffectComponent } from '@/integrations/erxes-messenger/components/EMFormValueEffect';
import { useCreateMessenger } from '@/integrations/erxes-messenger/hooks/useCreateMessenger';
import { useEditMessenger } from '@/integrations/erxes-messenger/hooks/useEditMessenger';
import { useAtomValue, useSetAtom } from 'jotai';
import { resetErxesMessengerSetupAtom } from '@/integrations/erxes-messenger/states/EMSetupResetState';
import { erxesMessengerSetupEditSheetOpenAtom } from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { useParams } from 'react-router';
import { SelectTicketConfig } from '@/pipelines/components/configs/components/SelectTicketConfig';

type EMConfigFormValues = z.infer<typeof EM_CONFIG_SCHEMA>;

export const EMConfig = () => {
  const { id } = useParams();
  const form = useForm<EMConfigFormValues>({
    resolver: zodResolver(EM_CONFIG_SCHEMA),
    defaultValues: {
      name: '',
      channelId: id,
    },
  });

  const resetErxesMessengerSetup = useSetAtom(resetErxesMessengerSetupAtom);
  const idToEdit = useAtomValue(erxesMessengerSetupEditSheetOpenAtom);

  const { createMessenger, loading: createLoading } = useCreateMessenger();
  const { editMessenger, loading: editLoading } = useEditMessenger();

  const loading = createLoading || editLoading;
  const isEditMode = !!idToEdit;

  return (
    <Form {...form}>
      <EMFormValueEffectComponent
        form={form}
        atom={erxesMessengerSetupConfigAtom}
      />
      <form
        onSubmit={form.handleSubmit((values) => {
          if (isEditMode && idToEdit) {
            editMessenger(idToEdit, values, () => {
              form.reset();
              resetErxesMessengerSetup();
            });
          } else {
            createMessenger(values, () => {
              form.reset();
              resetErxesMessengerSetup();
            });
          }
        })}
        className="flex-auto flex flex-col overflow-hidden"
      >
        <EMLayout
          title="Config"
          actions={
            <>
              <EMLayoutPreviousStepButton />
              <Button type="submit" disabled={loading}>
                {loading && <Spinner size="sm" />}
                Save
              </Button>
            </>
          }
        >
          <div className="p-4 pt-0 space-y-6 overflow-auto styled-scroll flex-1">
            <Collapsible defaultOpen>
              <Collapsible.TriggerButton className="font-mono uppercase font-semibold">
                <Collapsible.TriggerIcon />
                Integration Setup
              </Collapsible.TriggerButton>
              <Collapsible.Content className="p-2 space-y-6">
                <Form.Field
                  name="name"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Name</Form.Label>
                      <Form.Control>
                        <Input {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </Collapsible.Content>
            </Collapsible>
            <Collapsible>
              <Collapsible.TriggerButton className="font-mono uppercase font-semibold">
                <Collapsible.TriggerIcon />
                Bot Setup
              </Collapsible.TriggerButton>
              <Collapsible.Content className="p-2 space-y-4">
                <Form.Field
                  name="botSetup.greetingMessage"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Greeting Message</Form.Label>
                      <Form.Control>
                        <Textarea {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <PersistentMenu form={form} />
                <Form.Field
                  name="botSetup.botCheck"
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
                          Generate Messenger Bots
                        </Form.Label>
                      </div>
                      <Form.Description>
                        Please check messenger bot
                      </Form.Description>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </Collapsible.Content>
            </Collapsible>
            <Collapsible>
              <Collapsible.TriggerButton className="font-mono uppercase font-semibold">
                <Collapsible.TriggerIcon />
                Cloudflare calls setup
              </Collapsible.TriggerButton>
              <Collapsible.Content className="p-2 space-y-4">
                <Form.Field
                  name="cloudflareCallsSetup.header"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Header</Form.Label>
                      <Form.Control>
                        <Input {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="cloudflareCallsSetup.description"
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
                  name="cloudflareCallsSetup.secondPageHeader"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Second page header</Form.Label>
                      <Form.Control>
                        <Input {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="cloudflareCallsSetup.secondPageDescription"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Second page description</Form.Label>
                      <Form.Control>
                        <Textarea {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <CallRouting form={form} />
                <Form.Field
                  name="cloudflareCallsSetup.turnOn"
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
                          Turn on Cloudflare Calls
                        </Form.Label>
                      </div>
                      <Form.Description>
                        If turned on, possible to receive web calls
                      </Form.Description>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </Collapsible.Content>
            </Collapsible>
            <Collapsible>
              <Collapsible.TriggerButton className="font-mono uppercase font-semibold">
                <Collapsible.TriggerIcon />
                Ticket config
              </Collapsible.TriggerButton>
              <Collapsible.Content className="p-2 space-y-4">
                <Form.Field
                  name="ticketConfigId"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Select ticket config</Form.Label>
                      <Form.Control>
                        <SelectTicketConfig.FormItem
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
              </Collapsible.Content>
            </Collapsible>
          </div>
        </EMLayout>
      </form>
    </Form>
  );
};

const PersistentMenu = ({
  form,
}: {
  form: UseFormReturn<z.infer<typeof EM_CONFIG_SCHEMA>>;
}) => {
  const { control } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'botSetup.persistentMenu',
  });

  return (
    <Form.Item>
      <Form.Label className="flex items-center">
        Persistent Menu
        <Tooltip.Provider>
          <Tooltip delayDuration={100}>
            <Tooltip.Trigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 rounded-full size-5 px-1"
              >
                <IconQuestionMark />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content className="max-w-80">
              A Persistent Menu is a quick-access toolbar in your chat.
              Customize it below for easy navigation to key bot features.
            </Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>
      </Form.Label>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div className="flex gap-2 items-end" key={field.id}>
            <Form.Field
              key={field.id}
              name={`botSetup.persistentMenu.${index}.text`}
              render={({ field }) => (
                <Form.Item className="flex-auto">
                  <Form.Label>Text</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              key={field.id}
              name={`botSetup.persistentMenu.${index}.type`}
              render={({ field }) => (
                <Form.Item className="flex-auto">
                  <Form.Label>Type</Form.Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Form.Control>
                      <Select.Trigger>
                        <Select.Value placeholder="Select a type" />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      <Select.Item value="button">Button</Select.Item>
                      <Select.Item value="link">Link</Select.Item>
                    </Select.Content>
                  </Select>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Button
              onClick={() => remove(index)}
              variant="secondary"
              size="icon"
              className="size-8 bg-destructive/10 hover:bg-destructive/20 text-destructive"
            >
              <IconTrash />
            </Button>
          </div>
        ))}
      </div>
      <Button
        onClick={() => append({ text: '', type: 'button' })}
        className="flex w-full mt-5!"
        variant="secondary"
      >
        <IconPlus />
        Add persistent menu
      </Button>
    </Form.Item>
  );
};

const CallRouting = ({
  form,
}: {
  form: UseFormReturn<z.infer<typeof EM_CONFIG_SCHEMA>>;
}) => {
  const { control } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'cloudflareCallsSetup.callRouting',
  });

  return (
    <Form.Item>
      <Form.Label>Call routing</Form.Label>
      <div className="space-y-3">
        {fields.map((field, index) => (
          <div className="flex gap-2 items-end">
            <Form.Field
              key={field.id}
              name={`cloudflareCallsSetup.callRouting.${index}.name`}
              render={({ field }) => (
                <Form.Item className="flex-auto">
                  <Form.Label>Name</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              key={field.id}
              name={`cloudflareCallsSetup.callRouting.${index}.operatorIds`}
              render={({ field }) => (
                <Form.Item className="flex-auto">
                  <Form.Label>Operator IDs</Form.Label>
                  <SelectMember.FormItem
                    value={field.value}
                    onValueChange={field.onChange}
                    mode="multiple"
                    className="max-w-96"
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Button
              onClick={() => remove(index)}
              variant="secondary"
              size="icon"
              className="size-8 bg-destructive/10 hover:bg-destructive/20 text-destructive"
            >
              <IconTrash />
            </Button>
          </div>
        ))}
      </div>
      <Button
        onClick={() => append({ name: '', operatorIds: [] })}
        className="flex w-full mt-5!"
        variant="secondary"
      >
        <IconPlus />
        Add call routing
      </Button>
    </Form.Item>
  );
};
