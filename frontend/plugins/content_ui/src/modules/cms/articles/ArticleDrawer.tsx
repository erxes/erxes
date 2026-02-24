import { useMutation } from '@apollo/client';
import { IconUpload } from '@tabler/icons-react';
import {
  Button,
  Editor,
  Form,
  IAttachment,
  Input,
  IPdfAttachment,
  MultipleSelector,
  ScrollArea,
  Select,
  Sheet,
  Switch,
  Textarea,
  Upload,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { REACTIONS } from '../constants';
import { ADD_ARTICLE, EDIT_ARTICLE } from '../graphql/mutations';
import { ARTICLES } from '../graphql/queries';
import { useArticles } from '../hooks/useArticles';

interface Article {
  _id: string;
  code: string;
  title: string;
  summary: string;
  content: string;
  status: string;
  isPrivate?: boolean;
  reactionChoices?: string[];
  image?: IAttachment;
  attachments?: IAttachment[];
  pdfAttachment?: IPdfAttachment;
  categoryId: string;
}

interface ArticleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  article?: Article;
  categoryId: string;
}

interface ArticleFormData {
  code: string;
  title: string;
  summary: string;
  content: string;
  status: string;
  isPrivate: boolean;
  reactionChoices: string[];
  image?: IAttachment;
  attachments: IAttachment[];
  pdfAttachment?: IPdfAttachment;
}

export function ArticleDrawer({
  isOpen,
  onClose,
  article,
  categoryId,
}: ArticleDrawerProps) {
  const isEditing = !!article;
  const { refetch } = useArticles({
    categoryIds: [categoryId],
  });
  const form = useForm<ArticleFormData>({
    defaultValues: {
      code: '',
      title: '',
      summary: '',
      content: '',
      status: 'draft',
      isPrivate: false,
      reactionChoices: [],
      image: undefined,
      attachments: [],
      pdfAttachment: undefined,
    },
  });

  useEffect(() => {
    if (article) {
      form.reset({
        code: article.code || '',
        title: article.title || '',
        summary: article.summary || '',
        content: article.content || '',
        status: article.status || 'draft',
        isPrivate: article.isPrivate || false,
        reactionChoices: article.reactionChoices || [],
        image: article.image,
        attachments: article.attachments || [],
        pdfAttachment: article.pdfAttachment,
      });
    } else {
      form.reset({
        code: '',
        title: '',
        summary: '',
        content: '',
        status: 'draft',
        isPrivate: false,
        reactionChoices: [],
        image: undefined,
        attachments: [],
        pdfAttachment: undefined,
      });
    }
  }, [article, form]);

  const [addArticle] = useMutation(ADD_ARTICLE, {
    refetchQueries: [{ query: ARTICLES }],
    onCompleted: () => {
      onClose();
      form.reset();
      refetch();
    },
  });

  const [editArticle] = useMutation(EDIT_ARTICLE, {
    refetchQueries: [{ query: ARTICLES }],
    onCompleted: () => {
      onClose();
      form.reset();
      refetch();
    },
  });

  const onSubmit = (data: ArticleFormData) => {
    if (isEditing && article) {
      editArticle({
        variables: {
          _id: article._id,
          input: {
            ...data,
            categoryId: categoryId || article.categoryId,
          },
        },
      });
    } else {
      addArticle({
        variables: {
          input: {
            ...data,
            categoryId,
          },
        },
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <Sheet.View
        className="sm:max-w-lg p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full overflow-hidden"
          >
            <Sheet.Header className="border-b gap-3">
              <Sheet.Title>
                {isEditing ? 'Edit Article' : 'New Article'}
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="flex-auto overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <Form.Field
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Code</Form.Label>
                        <Form.Control>
                          <Input {...field} placeholder="Enter article code" />
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
                            placeholder="Enter article title"
                            required
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Summary</Form.Label>
                        <Form.Control>
                          <Textarea
                            {...field}
                            placeholder="Enter article summary"
                          />
                        </Form.Control>
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
                        <Form.Control>
                          <Editor
                            initialContent={field.value}
                            onChange={field.onChange}
                            scope={'ArticleDrawerContentField'}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Status</Form.Label>
                        <Form.Control>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <Select.Trigger>
                              <Select.Value placeholder="Select Status" />
                            </Select.Trigger>
                            <Select.Content>
                              <Select.Item value="draft">Draft</Select.Item>
                              <Select.Item value="publish">
                                Published
                              </Select.Item>
                              <Select.Item value="archived">
                                Archived
                              </Select.Item>
                              <Select.Item value="scheduled">
                                Scheduled
                              </Select.Item>
                            </Select.Content>
                          </Select>
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="isPrivate"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Is Private</Form.Label>
                        <Form.Control>
                          <Switch
                            id="isPrivate"
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="reactionChoices"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Reaction Choices</Form.Label>
                        <Form.Control>
                          <MultipleSelector
                            options={REACTIONS}
                            value={
                              field.value?.map((choice) => ({
                                value: choice,
                                label:
                                  REACTIONS.find(
                                    (reaction) => reaction.value === choice,
                                  )?.label || '',
                              })) || []
                            }
                            onChange={(value) => {
                              field.onChange(value.map((item) => item.value));
                            }}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Image</Form.Label>
                        <Form.Control>
                          <Upload.Root
                            value={field.value?.url || ''}
                            onChange={(value) => {
                              if ('url' in value) {
                                field.onChange({
                                  url: value.url,
                                  name: value.fileInfo?.name || '',
                                });
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
                    name="attachments"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Attachments</Form.Label>
                        <Form.Control>
                          <div className="space-y-2">
                            {field.value?.map((attachment, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <Upload.Root
                                  value={attachment.url}
                                  onChange={(value) => {
                                    if ('url' in value) {
                                      const newAttachments = [
                                        ...(field.value || []),
                                      ];
                                      newAttachments[index] = {
                                        url: value.url,
                                        name: value.fileInfo?.name || '',
                                        size: value.fileInfo?.size || 0,
                                        type:
                                          value.fileInfo?.type ||
                                          'application/octet-stream',
                                      };
                                      field.onChange(newAttachments);
                                    }
                                  }}
                                >
                                  <Upload.Preview />
                                  <div className="flex gap-2">
                                    <Upload.Button
                                      size="sm"
                                      variant="outline"
                                      type="button"
                                    >
                                      <IconUpload className="h-4 w-4 mr-2" />
                                      Replace
                                    </Upload.Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      type="button"
                                      onClick={() => {
                                        const newAttachments = [
                                          ...(field.value || []),
                                        ];
                                        newAttachments.splice(index, 1);
                                        field.onChange(newAttachments);
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </Upload.Root>
                              </div>
                            ))}
                            <Upload.Root
                              value=""
                              onChange={(value) => {
                                if ('url' in value) {
                                  const newAttachment = {
                                    url: value.url,
                                    name: value.fileInfo?.name || '',
                                  };
                                  field.onChange([
                                    ...(field.value || []),
                                    newAttachment,
                                  ]);
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
                                  Add file
                                </Upload.Button>
                              </div>
                            </Upload.Root>
                          </div>
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="pdfAttachment"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>PDF Attachment</Form.Label>
                        <Form.Control>
                          <Upload.Root
                            value={field.value?.pdf?.url || ''}
                            onChange={(value) => {
                              if ('url' in value) {
                                field.onChange({
                                  pdf: {
                                    url: value.url,
                                    name: value.fileInfo?.name || '',
                                  },
                                });
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
                                Upload PDF
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
                </div>
              </ScrollArea>
            </Sheet.Content>

            <Sheet.Footer className="flex justify-end  p-2.5 gap-1 bg-muted">
              <Button
                type="button"
                variant="ghost"
                className="bg-background hover:bg-background/90"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}
