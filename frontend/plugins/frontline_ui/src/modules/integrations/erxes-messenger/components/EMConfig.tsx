import {
  ControllerRenderProps,
  useFieldArray,
  useForm,
  UseFormReturn,
} from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EM_CONFIG_SCHEMA } from '@/integrations/erxes-messenger/constants/emConfigSchema';
import { useQuery } from '@apollo/client';
import {
  Button,
  Collapsible,
  Combobox,
  Command,
  Form,
  Input,
  Popover,
  Select,
  Spinner,
  Switch,
  Textarea,
  Tooltip,
} from 'erxes-ui';
import { EM_MESSENGER_AUTOMATIONS } from '@/integrations/erxes-messenger/graphql/queries/emAutomationsQueries';
import {
  EMLayout,
  EMLayoutPreviousStepButton,
} from '@/integrations/erxes-messenger/components/EMLayout';
import { SelectMember, SelectBrand } from 'ui-modules';
import { IconPlus, IconQuestionMark, IconTrash } from '@tabler/icons-react';
import {
  erxesMessengerSetupConfigAtom,
  erxesMessengerSetupEditSheetOpenAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMFormValueEffectComponent } from '@/integrations/erxes-messenger/components/EMFormValueEffect';
import { useCreateMessenger } from '@/integrations/erxes-messenger/hooks/useCreateMessenger';
import { useEditMessenger } from '@/integrations/erxes-messenger/hooks/useEditMessenger';
import { useAtomValue, useSetAtom } from 'jotai';
import { resetErxesMessengerSetupAtom } from '@/integrations/erxes-messenger/states/EMSetupResetState';
import { useParams } from 'react-router';
import { SelectTicketConfig } from '@/pipelines/components/configs/components/SelectTicketConfig';
import { useState } from 'react';
import { useTopics } from '@/knowledgebase/hooks/useTopics';
import { EM_CONTENT_TYPES } from '../constants/emContentTypes';

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
                <Form.Field
                  name="brandId"
                  rules={{ required: 'Brand is required' }}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Brand</Form.Label>
                      <Form.Control>
                        <SelectBrand
                          value={field.value}
                          onValueChange={field.onChange}
                          placeholder="Select a brand"
                          className="w-full h-10 rounded-lg border bg-background"
                        />
                      </Form.Control>
                      <Form.Description>
                        Choose the brand for this integration
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
                          Enable AI Bot
                        </Form.Label>
                      </div>
                      <Form.Description>
                        When enabled, incoming messages will be handled by the
                        selected automation bot.
                      </Form.Description>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="botSetup.botShowInitialMessage"
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
                          Show Initial Message
                        </Form.Label>
                      </div>
                      <Form.Description>
                        When enabled, the bot will display the greeting message
                        as an initial message in the conversation.
                      </Form.Description>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                {form.watch('botSetup.botCheck') && (
                  <Form.Field
                    name="botSetup.automationId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Automation Bot</Form.Label>
                        <Form.Control>
                          <SelectMessengerAutomation
                            value={field.value ?? ''}
                            onChange={field.onChange}
                          />
                        </Form.Control>
                        <Form.Description>
                          Select the automation that handles messenger bot
                          replies. The automation must have a &quot;Messenger
                          Message&quot; trigger.
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                )}
              </Collapsible.Content>
            </Collapsible>
            {/* <Collapsible>
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
            </Collapsible> */}
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
            <Collapsible>
              <Collapsible.TriggerButton className="font-mono uppercase font-semibold">
                <Collapsible.TriggerIcon />
                Knowledge base topic
              </Collapsible.TriggerButton>
              <Collapsible.Content className="p-2 space-y-4">
                <Form.Field<
                  z.infer<typeof EM_CONFIG_SCHEMA>,
                  'knowledgeBaseTopicId'
                >
                  name="knowledgeBaseTopicId"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Select knowledge base topic</Form.Label>
                      <Form.Control>
                        <SelectKnowledgeBaseTopic field={field} />
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
  const { control, watch } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'botSetup.persistentMenu',
  });

  const persistentMenuValues = watch('botSetup.persistentMenu');

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
        {fields.map((field, index) => {
          const currentType = persistentMenuValues?.[index]?.type;
          return (
            <div className="space-y-2" key={field.id}>
              <div className="flex gap-2 items-end">
                <Form.Field
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
                  name={`botSetup.persistentMenu.${index}.type`}
                  render={({ field }) => (
                    <Form.Item className="flex-auto">
                      <Form.Label>Type</Form.Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Form.Control>
                          <Select.Trigger className="mb-0">
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
              {/* Always register `link` so reset() retains its value;
                  only show the UI when type === 'link' */}
              <Form.Field
                name={`botSetup.persistentMenu.${index}.link`}
                render={({ field }) => (
                  <Form.Item className={currentType === 'link' ? '' : 'hidden'}>
                    <Form.Label>URL</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        type="url"
                        placeholder="https://example.com"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                name={`botSetup.persistentMenu.${index}.contentType`}
                render={({ field }) => (
                  <Form.Item
                    className={currentType === 'button' ? '' : 'hidden'}
                  >
                    <Form.Label>Content type</Form.Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value placeholder="Select content type" />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {EM_CONTENT_TYPES.map(({ type, label }) => (
                          <Select.Item key={type} value={type}>
                            {label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          );
        })}
      </div>
      <Button
        onClick={() =>
          append({ text: '', type: 'button', contentType: 'text' })
        }
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

const SelectMessengerAutomation = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const { data, loading } = useQuery(EM_MESSENGER_AUTOMATIONS, {
    variables: { triggerTypes: ['frontline:inbox.messages'] },
  });

  const automations: { _id: string; name: string; status: string }[] =
    data?.automations || [];

  const selected = automations.find((a) => a._id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger className="w-full">
        <span className={selected ? '' : 'text-muted-foreground'}>
          {loading
            ? 'Loading…'
            : selected
            ? selected.name
            : 'Select an automation'}
        </span>
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.List>
            <Command.Input placeholder="Search automation…" />
            <Command.Empty>
              No automations found with a Messenger Message trigger.
            </Command.Empty>
            {automations.map((automation) => (
              <Command.Item
                key={automation._id}
                value={automation._id}
                onSelect={(v) => {
                  onChange(v === value ? '' : v);
                  setOpen(false);
                }}
              >
                <span className="flex-1">{automation.name}</span>
                <span className="ml-2 text-xs text-muted-foreground capitalize">
                  {automation.status}
                </span>
                {automation._id === value && <Combobox.Check />}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const SelectKnowledgeBaseTopic = ({
  field,
}: {
  field: ControllerRenderProps<
    z.infer<typeof EM_CONFIG_SCHEMA>,
    'knowledgeBaseTopicId'
  >;
}) => {
  const [_open, _setOpen] = useState<boolean>(false);
  const { topics } = useTopics();
  const selectedTopic = (field.value?.length &&
    topics?.find((t) => t._id === field.value)) || { title: 'Select a topic' };

  console.log('topic', field.value);

  return (
    <Popover open={_open} onOpenChange={_setOpen}>
      <Combobox.Trigger>
        <span>{selectedTopic.title}</span>
      </Combobox.Trigger>
      <Combobox.Content>
        <Command>
          <Command.List>
            <Command.Input placeholder="Search topic ..." />
            {topics &&
              topics.map((topic) => (
                <Command.Item
                  key={topic._id}
                  value={topic._id}
                  onSelect={(v) => {
                    field.onChange(v);
                    _setOpen(false);
                  }}
                >
                  {topic.title}
                  {topic._id === field.value && <Combobox.Check />}
                </Command.Item>
              ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
