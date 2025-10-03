import { useMutation } from '@apollo/client';
import { IconUpload } from '@tabler/icons-react';
import { Button, Form, Input, Select, Sheet, Textarea, Upload } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ADD_TOPIC, EDIT_TOPIC } from '../graphql/mutations';
import { TOPICS } from '../graphql/queries';
import { SelectBrand } from 'ui-modules';
import { LANGUAGES } from '../../../constants';

interface Topic {
  _id: string;
  title: string;
  description: string;
  code: string;
  brandId: string;
  color: string;
  backgroundImage: string;
  languageCode: string;
  notificationSegmentId: string;
}

interface TopicDrawerProps {
  topic?: Topic;
  isOpen: boolean;
  onClose: () => void;
}

interface TopicFormData {
  code: string;
  title: string;
  description: string;
  brandId: string;
  color: string;
  backgroundImage: string;
  languageCode: string;
  notificationSegmentId: string;
}

export function TopicDrawer({ topic, isOpen, onClose }: TopicDrawerProps) {
  const isEditing = !!topic;

  const form = useForm<TopicFormData>({
    defaultValues: {
      code: '',
      title: '',
      description: '',
      brandId: '',
      color: '',
      backgroundImage: '',
      languageCode: '',
      notificationSegmentId: '',
    },
  });

  useEffect(() => {
    if (topic) {
      form.reset({
        code: topic.code || '',
        title: topic.title || '',
        description: topic.description || '',
        brandId: topic.brandId || '',
        color: topic.color || '',
        backgroundImage: topic.backgroundImage || '',
        languageCode: topic.languageCode || '',
        notificationSegmentId: topic.notificationSegmentId || '',
      });
    } else {
      form.reset({
        code: '',
        title: '',
        description: '',
        brandId: '',
        color: '',
        backgroundImage: '',
        languageCode: '',
        notificationSegmentId: '',
      });
    }
  }, [topic, form]);

  const [addTopic, { loading: adding }] = useMutation(ADD_TOPIC, {
    refetchQueries: [{ query: TOPICS }],
    onCompleted: () => {
      onClose();
      form.reset();
    },
  });

  const [editTopic, { loading: editing }] = useMutation(EDIT_TOPIC, {
    refetchQueries: [{ query: TOPICS }],
    onCompleted: () => {
      onClose();
      form.reset();
    },
  });

  const onSubmit = (data: TopicFormData) => {
    if (isEditing && topic) {
      editTopic({
        variables: {
          _id: topic._id,
          input: data,
        },
      });
    } else {
      addTopic({
        variables: {
          input: data,
        },
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <Sheet.View className="sm:max-w-lg p-0">
        <Sheet.Header className="border-b gap-3">
          <Sheet.Title>{isEditing ? 'Edit Topic' : 'New Topic'}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-4 space-y-4"
          >
            <Form.Field
              control={form.control}
              name="code"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Code</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="Enter topic code" />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="title"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Title</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="Enter topic title"
                      required
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="description"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Description</Form.Label>
                  <Form.Control>
                    <Textarea
                      {...field}
                      placeholder="Enter topic description"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="color"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Color</Form.Label>
                  <Form.Control>
                    <Input {...field} type="color" />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="backgroundImage"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Background Image</Form.Label>
                  <Form.Control>
                    <Upload.Root
                      value={field.value}
                      onChange={(fileInfo) => {
                        if ('url' in fileInfo) {
                          field.onChange(fileInfo.url);
                        }
                      }}
                    >
                      <Upload.Preview />
                      <div className="flex flex-col gap-2">
                        <Upload.Button
                          size="sm"
                          variant="outline"
                          type="button"
                        >
                          <IconUpload className="h-4 w-4 mr-2" />
                          Upload image
                        </Upload.Button>
                        <Upload.RemoveButton
                          size="sm"
                          variant="outline"
                          type="button"
                        />
                      </div>
                    </Upload.Root>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="brandId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Brand</Form.Label>
                  <Form.Control>
                    <SelectBrand
                      {...field}
                      onValueChange={field.onChange}
                      value={field.value}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="languageCode"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Language Code</Form.Label>
                  <Form.Control>
                    <Select
                      {...field}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Select language" />
                      </Select.Trigger>
                      <Select.Content>
                        {LANGUAGES.map((lang) => (
                          <Select.Item key={lang.value} value={lang.value}>
                            {lang.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button type="submit" disabled={adding || editing}>
                {adding || editing
                  ? isEditing
                    ? 'Saving...'
                    : 'Creating...'
                  : isEditing
                  ? 'Save Changes'
                  : 'Create Topic'}
              </Button>
            </div>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}
