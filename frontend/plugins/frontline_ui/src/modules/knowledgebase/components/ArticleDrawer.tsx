import { useMutation } from '@apollo/client';
import { IconUpload, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Editor,
  Form,
  Input,
  MultipleSelector,
  ScrollArea,
  Select,
  Sheet,
  Switch,
  Textarea,
  Upload,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { REACTIONS } from '../constants';
import { ADD_ARTICLE, EDIT_ARTICLE } from '../graphql/mutations';
import { ARTICLES } from '../graphql/queries';
import { useArticles } from '../hooks/useArticles';
import type {
  ArticleFormData,
  ArticleInput,
  IKnowledgeBaseArticle,
} from '../types';

interface ArticleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  article?: IKnowledgeBaseArticle;
  categoryId: string;
  onSaved?: () => void;
  refetch?: () => void;
}

const toArticleInput = (data: ArticleFormData): ArticleInput => {
  const { fileUrl, fileSize, fileDuration, fileName, fileType, ...clean } =
    data;

  // Ensure content is not empty
  if (!clean.content || clean.content.trim() === '') {
    clean.content = '<p></p>';
  }

  return clean;
};

export function ArticleDrawer({
  isOpen,
  onClose,
  article,
  categoryId,
  onSaved,
  refetch: externalRefetch,
}: ArticleDrawerProps) {
  const isEditing = !!article;
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const { refetch: internalRefetch } = useArticles({
    categoryIds: [categoryId],
  });
  const form = useForm<ArticleFormData>({
    defaultValues: {
      title: '',
      summary: '',
      content: '<p></p>',
      status: 'draft',
      isPrivate: false,
      reactionChoices: [],
      image: undefined,
      attachments: [],
      pdfAttachment: undefined,
      fileUrl: '',
      fileSize: 0,
      fileDuration: 0,
      fileName: '',
      fileType: '',
      customForms: [],
    },
  });

  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title || '',
        summary: article.summary || '',
        content: article.content || '<p></p>',
        status: article.status || 'draft',
        isPrivate: article.isPrivate || false,
        reactionChoices: article.reactionChoices || [],
        image: article.image,
        attachments: article.attachments || [],
        pdfAttachment: article.pdfAttachment,
        fileUrl: article.fileUrl || '',
        fileSize: article.fileSize || 0,
        fileDuration: article.fileDuration || 0,
        fileName: article.fileName || '',
        fileType: article.fileType || '',
        customForms: article.customForms || [],
      });
    } else {
      form.reset({
        title: '',
        summary: '',
        content: '<p></p>',
        status: 'draft',
        isPrivate: false,
        reactionChoices: [],
        image: undefined,
        attachments: [],
        pdfAttachment: undefined,
        fileUrl: '',
        fileSize: 0,
        fileDuration: 0,
        fileName: '',
        fileType: '',
        customForms: [],
      });
    }
  }, [article, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'customForms',
  });

  const [addArticle, { loading: adding }] = useMutation(ADD_ARTICLE, {
    onCompleted: () => {
      onClose();
      form.reset();
      externalRefetch?.();
      internalRefetch();
      onSaved?.();
    },
  });

  const [editArticle, { loading: editing }] = useMutation(EDIT_ARTICLE, {
    onCompleted: () => {
      onClose();
      form.reset();
      externalRefetch?.();
      internalRefetch();
      onSaved?.();
    },
  });

  const onSubmit = (data: ArticleFormData) => {
    const doc = {
      ...toArticleInput(data),
      categoryId,
    };

    if (isEditing && article) {
      editArticle({
        variables: {
          _id: article._id,
          doc,
        },
      });
    } else {
      addArticle({
        variables: {
          doc,
        },
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <Sheet.View className="sm:max-w-lg">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            <Sheet.Header className="border-b gap-3 flex-shrink-0">
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
                    name="title"
                    rules={{ required: 'Title is required' }}
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Title</Form.Label>
                        <Form.Control>
                          <Input {...field} placeholder="Enter article title" />
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
                    rules={{ required: 'Content is required' }}
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
                      <Form.Item className="flex items-center gap-2">
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMoreInfo(!showMoreInfo)}
                    className="w-full"
                  >
                    {showMoreInfo ? 'See less' : 'Fill in more info'}
                  </Button>

                  {showMoreInfo && (
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium text-sm">File Details</h4>

                      <Form.Field
                        control={form.control}
                        name="fileUrl"
                        render={({ field }) => (
                          <Form.Item>
                            <Form.Label>File URL</Form.Label>
                            <Form.Control>
                              <Input {...field} placeholder="Enter file URL" />
                            </Form.Control>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />

                      <Form.Field
                        control={form.control}
                        name="fileSize"
                        render={({ field }) => (
                          <Form.Item>
                            <Form.Label>File Size (byte)</Form.Label>
                            <Form.Control>
                              <Input
                                {...field}
                                type="number"
                                placeholder="Enter file size"
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(
                                    value === '' ? 0 : Number(value),
                                  );
                                }}
                              />
                            </Form.Control>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />

                      <Form.Field
                        control={form.control}
                        name="fileDuration"
                        render={({ field }) => (
                          <Form.Item>
                            <Form.Label>File Duration (sec)</Form.Label>
                            <Form.Control>
                              <Input
                                {...field}
                                type="number"
                                placeholder="Enter file duration"
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(
                                    value === '' ? 0 : Number(value),
                                  );
                                }}
                              />
                            </Form.Control>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />

                      <Form.Field
                        control={form.control}
                        name="fileName"
                        render={({ field }) => (
                          <Form.Item>
                            <Form.Label>File Name</Form.Label>
                            <Form.Control>
                              <Input {...field} placeholder="Enter file name" />
                            </Form.Control>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />

                      <Form.Field
                        control={form.control}
                        name="fileType"
                        render={({ field }) => (
                          <Form.Item>
                            <Form.Label>File Type</Form.Label>
                            <Form.Control>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <Select.Trigger>
                                  <Select.Value placeholder="Select type" />
                                </Select.Trigger>
                                <Select.Content>
                                  <Select.Item value="image">Image</Select.Item>
                                  <Select.Item value="video">Video</Select.Item>
                                  <Select.Item value="audio">Audio</Select.Item>
                                  <Select.Item value="document">
                                    Document
                                  </Select.Item>
                                  <Select.Item value="other">Other</Select.Item>
                                </Select.Content>
                              </Select>
                            </Form.Control>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />
                    </div>
                  )}

                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Custom Forms</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          append({
                            id: Date.now().toString(),
                            label: '',
                            value: '',
                          })
                        }
                      >
                        Add another form
                      </Button>
                    </div>

                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-2 p-3 border rounded-lg"
                      >
                        <div className="flex-1 space-y-2">
                          <Form.Field
                            control={form.control}
                            name={`customForms.${index}.label`}
                            render={({ field }) => (
                              <Form.Item>
                                <Form.Label>Label</Form.Label>
                                <Form.Control>
                                  <Input {...field} placeholder="Form label" />
                                </Form.Control>
                                <Form.Message />
                              </Form.Item>
                            )}
                          />
                          <Form.Field
                            control={form.control}
                            name={`customForms.${index}.value`}
                            render={({ field }) => (
                              <Form.Item>
                                <Form.Label>Value</Form.Label>
                                <Form.Control>
                                  <Textarea
                                    {...field}
                                    placeholder="Form value"
                                  />
                                </Form.Control>
                                <Form.Message />
                              </Form.Item>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                          className="mt-6"
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </Sheet.Content>

            <Sheet.Footer className="flex justify-end flex-shrink-0 p-2.5 gap-1 bg-muted">
              <Button
                type="button"
                variant="ghost"
                className="bg-background hover:bg-background/90"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={adding || editing}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {adding || editing ? 'Saving...' : 'Save'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
}
