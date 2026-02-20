import { useMutation } from '@apollo/client';
import { IconUpload, IconCode } from '@tabler/icons-react';
import { Button, Form, Input, Select, Sheet, Textarea, Upload, Badge, Dialog } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ADD_TOPIC, EDIT_TOPIC } from '../graphql/mutations';
import { TOPICS } from '../graphql/queries';
import { SelectBrand } from 'ui-modules';
import { LANGUAGES } from '../constants';
import { REACT_APP_WIDGETS_URL } from '@/utils';

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
  onSaved?: () => void;
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

export function TopicDrawer({ topic, isOpen, onClose, onSaved }: TopicDrawerProps) {
  const isEditing = !!topic;
  const [scriptDialogOpen, setScriptDialogOpen] = useState(false);

  // Generate embed script for topic
  const generateTopicScript = (topicId: string) => {
    const API = REACT_APP_WIDGETS_URL;
    return `<script>
  window.erxesSettings = {
    knowledgeBase: {
      topicId: ${JSON.stringify(topicId)},
    },
  };

  (function () {
    var script = document.createElement("script");
    script.src = "${API}/knowledgeBaseBundle.js";
    script.async = true;
    var entry = document.getElementsByTagName("script")[0];
    entry.parentNode.insertBefore(script, entry);
  })();
</script>`;
  };

  const handleCopyScript = (script: string) => {
    navigator.clipboard
      .writeText(script)
      .then(() => {
        // Could add toast notification here
      })
      .catch(() => {
        // Handle error
      });
  };

  const form = useForm<TopicFormData>({
    defaultValues: {
      code: '',
      title: '',
      description: '',
      brandId: '',
      color: '#000000',
      backgroundImage: '',
      languageCode: 'en',
      notificationSegmentId: '',
    },
    mode: 'onChange',
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
        color: '#000000',
        backgroundImage: '',
        languageCode: 'en',
        notificationSegmentId: '',
      });
    }
  }, [topic, form]);

  const [addTopic, { loading: adding }] = useMutation(ADD_TOPIC, {
    refetchQueries: [{ query: TOPICS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      onSaved?.();
      onClose();
      form.reset();
    },
  });

  const [editTopic, { loading: editing }] = useMutation(EDIT_TOPIC, {
    refetchQueries: [{ query: TOPICS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      onSaved?.();
      onClose();
      form.reset();
    },
  });

  const onSubmit = (data: TopicFormData) => {
    const doc: TopicFormData = {
      ...data,
      title: data.title?.trim(),
      code: data.code?.trim(),
      description: data.description?.trim(),
    };

    if (isEditing && topic) {
      editTopic({
        variables: {
          _id: topic._id,
          doc,
        },
      });
      return;
    }

    addTopic({
      variables: {
        doc,
      },
    });
  };

  const busy = adding || editing;

  return (
    <Sheet open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <Sheet.View className="sm:max-w-lg p-0 flex flex-col h-full">
        <Sheet.Header className="border-b gap-3 flex-shrink-0">
          <Sheet.Title>{isEditing ? 'Edit Topic' : 'New Topic'}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
          >
            <Form.Field
              control={form.control}
              name="title"
              rules={{ required: 'Title is required' }}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Title *</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="Enter topic title" />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="code"
              rules={{ required: 'Code is required' }}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Code *</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="Enter topic code" />
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
                    <Textarea {...field} placeholder="Enter topic description" />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="brandId"
              rules={{ required: 'Brand is required' }}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Brand *</Form.Label>
                  <Form.Control>
                    <SelectBrand
                      onValueChange={field.onChange}
                      value={field.value}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <Form.Field
                control={form.control}
                name="color"
                rules={{ required: 'Color is required' }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Color *</Form.Label>
                    <Form.Control>
                      <Input {...field} type="color" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="languageCode"
                rules={{ required: 'Language is required' }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Language *</Form.Label>
                    <Form.Control>
                      <Select onValueChange={field.onChange} value={field.value}>
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
            </div>

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
                        if (fileInfo && typeof fileInfo === 'object' && 'url' in fileInfo) {
                          field.onChange((fileInfo as any).url);
                        }
                      }}
                    >
                      <Upload.Preview />
                      <div className="flex flex-col gap-2">
                        <Upload.Button size="sm" variant="outline" type="button">
                          <IconUpload className="h-4 w-4 mr-2" />
                          Upload image
                        </Upload.Button>
                        <Upload.RemoveButton size="sm" variant="outline" type="button" />
                      </div>
                    </Upload.Root>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            {isEditing && topic && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">Embed Script</h4>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setScriptDialogOpen(true)}
                  >
                    <IconCode className="h-4 w-4 mr-2" />
                    View Script
                  </Button>
                </div>
                <Badge variant="info" className="block w-full h-auto p-3">
                  <p className="text-sm">
                    Embed this knowledge base topic into your website using the script below.
                  </p>
                </Badge>
              </div>
            )}
          </form>
        </Form>

        <div className="border-t gap-3 p-4 bg-white flex-shrink-0 flex justify-end">
          <Button type="button" onClick={onClose} variant="outline" disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy} onClick={form.handleSubmit(onSubmit)}>
            {busy ? (isEditing ? 'Saving...' : 'Creating...') : isEditing ? 'Save Changes' : 'Create Topic'}
          </Button>
        </div>
      </Sheet.View>

      {isEditing && topic && (
        <Dialog open={scriptDialogOpen} onOpenChange={setScriptDialogOpen}>
          <Dialog.Content className="max-w-2xl">
            <Dialog.Header>
              <Dialog.Title>Knowledge Base Embed Script</Dialog.Title>
              <Dialog.Description>
                Copy and paste this script into your website's HTML to embed this knowledge base topic.
              </Dialog.Description>
            </Dialog.Header>

            <div className="space-y-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono">
                  <code>{generateTopicScript(topic._id)}</code>
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2"
                  onClick={() => handleCopyScript(generateTopicScript(topic._id))}
                >
                  Copy Script
                </Button>
              </div>

              <Badge variant="info" className="block w-full h-auto p-3">
                <h4 className="font-medium text-sm mb-2">Installation Steps:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                  <li>Copy the script above</li>
                  <li>Paste it into your website's HTML</li>
                  <li>Place it just before the closing {'</body>'} tag</li>
                  <li>The knowledge base topic widget will appear on your site</li>
                </ol>
              </Badge>
            </div>

            <Dialog.Footer>
              <Button variant="secondary" onClick={() => setScriptDialogOpen(false)}>
                Close
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      )}
    </Sheet>
  );
}
