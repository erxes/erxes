import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Editor,
  Form,
  Input,
  ScrollArea,
  Select,
  Sheet,
  toast,
} from 'erxes-ui';
import { useMutation } from 'erxes-sdk/react';
import { useForm } from 'react-hook-form';
import type * as z from 'zod';
import { ResponseTemplateInput } from '../../server/db/definitions/responseTemplates';
import {
  REFETCH_LISTS,
  RESPONSE_TEMPLATE_ADD,
  RESPONSE_TEMPLATE_EDIT,
  type StoredTemplate,
} from './graphql';
import type { ExtResponseTemplatesChannelListQuery } from './gql/graphql';
import { errorMessage } from './utils';

type Values = z.input<typeof ResponseTemplateInput>;

type Channel =
  ExtResponseTemplatesChannelListQuery['responseTemplatesChannels'][number];

const TemplateForm = ({
  template,
  channels,
  defaultChannelId,
  onDone,
}: {
  template?: StoredTemplate;
  channels: Channel[];
  defaultChannelId?: string;
  onDone: () => void;
}) => {
  const [add, { loading: adding }] = useMutation(RESPONSE_TEMPLATE_ADD, {
    refetchQueries: REFETCH_LISTS,
  });
  const [edit, { loading: editing }] = useMutation(RESPONSE_TEMPLATE_EDIT, {
    refetchQueries: REFETCH_LISTS,
  });
  const form = useForm<Values>({
    resolver: zodResolver(ResponseTemplateInput),
    defaultValues: {
      name: template?.name ?? '',
      content: template?.content ?? '',
      channelId: template?.channelId ?? defaultChannelId ?? '',
    },
  });

  const onSubmit = async (values: Values) => {
    try {
      if (template) {
        await edit({ variables: { ...values, _id: template._id } });
      } else {
        await add({ variables: values });
      }

      toast({
        title: template ? 'Template saved' : 'Template created',
        variant: 'success',
      });
      onDone();
    } catch (e) {
      toast({
        title: template ? 'Could not save' : 'Could not create',
        description: errorMessage(e),
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3"
      >
        <Form.Field
          control={form.control}
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
          control={form.control}
          name="channelId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Channel</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value placeholder="Choose a channel" />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  {channels.map((channel) => (
                    <Select.Item key={channel._id} value={channel._id}>
                      {channel.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="content"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Content</Form.Label>
              <ScrollArea className="h-[400px] rounded-md border p-2">
                <Editor
                  initialContent={field.value}
                  onChange={field.onChange}
                  className="min-h-[360px]"
                />
              </ScrollArea>
              <Form.Message />
            </Form.Item>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={adding || editing}>
            {template ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

/** Create a template, or edit `template`. Closing it discards the form. */
export const ResponseTemplateSheet = ({
  open,
  onOpenChange,
  ...props
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: StoredTemplate;
  channels: Channel[];
  defaultChannelId?: string;
}) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <Sheet.View className="p-0">
      <Sheet.Header>
        <Sheet.Title>
          {props.template ? 'Edit response template' : 'New response template'}
        </Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content className="grow px-5 py-4">
        {open && <TemplateForm {...props} onDone={() => onOpenChange(false)} />}
      </Sheet.Content>
    </Sheet.View>
  </Sheet>
);
