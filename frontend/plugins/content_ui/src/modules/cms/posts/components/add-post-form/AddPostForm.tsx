import {
  Form,
  Input,
  Textarea,
  Select,
  MultipleSelector,
  Switch,
  Tabs,
  Upload,
  Collapsible,
  Button,
  ScrollArea,
} from 'erxes-ui';
import { readImage } from 'erxes-ui/utils/core';
import { IconUpload, IconX } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { CustomFieldInput } from '../../CustomFieldInput';
import { GalleryUploader } from '../../GalleryUploader';
import { VideoUploader } from '../../VideoUploader';
import { AudioUploader } from '../../AudioUploader';
import { DocumentsUploader } from '../../DocumentsUploader';
import { AttachmentsUploader } from '../../AttachmentsUploader';
import { PostPreview } from '../../PostPreview';
import { formatInitialContent } from '../../formHelpers';
import { usePostForm } from './hooks/usePostForm';
import { usePostData } from './hooks/usePostData';
import { usePostSubmission } from './hooks/usePostSubmission';

interface AddPostFormProps {
  websiteId: string;
  editingPost?: any;
  onClose?: () => void;
  onFormReady?: (formState: {
    form: any;
    onSubmit: (data?: any) => Promise<void>;
    creating: boolean;
    saving: boolean;
  }) => void;
}

export const AddPostForm = ({
  websiteId,
  editingPost,
  onClose,
  onFormReady,
}: AddPostFormProps) => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const editingPostFromLocation = location?.state?.post as any;
  const currentEditingPost = editingPost || editingPostFromLocation;

  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'seo'>(
    'content',
  );

  const {
    form,
    selectedLanguage,
    setSelectedLanguage,
    translations,
    setTranslations,
    defaultLangData,
    setDefaultLangData,
    previousTypeRef,
    handleEditorChange,
    generateSlug,
    fullPost,
    updateCustomFieldValue,
    getCustomFieldValue,
  } = usePostForm(currentEditingPost);

  const selectedType = form.watch('type');
  const {
    categories,
    tags,
    customTypes,
    availableLanguages,
    defaultLanguage,
    fieldGroups,
  } = usePostData(websiteId, selectedType);

  const { onSubmit, creating, saving } = usePostSubmission({
    websiteId,
    editingPost: currentEditingPost,
    selectedLanguage,
    defaultLanguage,
    translations,
    defaultLangData,
    onClose,
    navigate,
    currentPath: location.pathname,
  });

  useEffect(() => {
    if (onFormReady && form) {
      onFormReady({
        form,
        onSubmit,
        creating,
        saving,
      });
    }
  }, [form, onSubmit, creating, saving, onFormReady]);

  useEffect(() => {
    if (!selectedLanguage && defaultLanguage) {
      setSelectedLanguage(defaultLanguage);
    }
  }, [defaultLanguage, selectedLanguage, setSelectedLanguage]);

  useEffect(() => {
    if (
      !currentEditingPost &&
      selectedType &&
      previousTypeRef.current &&
      previousTypeRef.current !== selectedType
    ) {
      form.setValue('customFieldsData', []);
    }
    previousTypeRef.current = selectedType;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, currentEditingPost]);

  const handleLanguageChange = (lang: string) => {
    if (lang === selectedLanguage) return;

    if (selectedLanguage === defaultLanguage) {
      setDefaultLangData({
        title: form.getValues('title') || '',
        content: form.getValues('content') || '',
        description: form.getValues('description') || '',
        customFieldsData: form.getValues('customFieldsData') || [],
      });
    } else {
      setTranslations((prev) => ({
        ...prev,
        [selectedLanguage]: {
          title: form.getValues('title'),
          content: form.getValues('content'),
          excerpt: form.getValues('description'),
          customFieldsData: form.getValues('customFieldsData'),
        },
      }));
    }

    if (lang === defaultLanguage) {
      const data = defaultLangData || {
        title: fullPost?.title || '',
        content: fullPost?.content || '',
        description: fullPost?.excerpt || fullPost?.description || '',
        customFieldsData: fullPost?.customFieldsData || [],
      };
      form.setValue('title', data.title);
      form.setValue('content', data.content);
      form.setValue('description', data.description);
      form.setValue('customFieldsData', data.customFieldsData);
    } else {
      const translation = translations[lang];
      form.setValue('title', translation?.title || '');
      form.setValue('content', translation?.content || '');
      form.setValue('description', translation?.excerpt || '');
      form.setValue('customFieldsData', translation?.customFieldsData || []);
    }

    setSelectedLanguage(lang);
  };
  return (
    <ScrollArea className="flex-auto overflow-hidden" viewportClassName="p-4">
      <div className="h-full flex flex-col w-full mb-4 px-4 pt-4">
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <div className="rounded-lg border overflow-hidden flex flex-col">
              <div className="px-4 pt-4 border-b">
                <Tabs
                  value={activeTab}
                  onValueChange={(v) =>
                    setActiveTab(v as 'content' | 'media' | 'seo')
                  }
                >
                  <Tabs.List>
                    <div className="flex justify-evenly items-center gap-4">
                      <Tabs.Trigger value="content" className="w-full">
                        Content
                      </Tabs.Trigger>
                      <Tabs.Trigger value="media" className="w-full">
                        Media
                      </Tabs.Trigger>
                    </div>
                  </Tabs.List>
                </Tabs>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="p-4 space-y-4 flex-1 overflow-y-auto"
                >
                  {activeTab === 'content' && (
                    <>
                      {currentEditingPost?._id &&
                        availableLanguages.length > 0 && (
                          <div className="space-y-3 p-2 rounded-md border">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-700">
                                  Language:
                                </span>
                                <Select
                                  value={selectedLanguage}
                                  onValueChange={handleLanguageChange}
                                >
                                  <Select.Trigger className="w-[180px]">
                                    <Select.Value />
                                  </Select.Trigger>
                                  <Select.Content>
                                    {availableLanguages.map((lang: string) => (
                                      <Select.Item key={lang} value={lang}>
                                        {lang.toUpperCase()}
                                        {lang === defaultLanguage && (
                                          <span className="ml-2 text-xs text-gray-500">
                                            (Default)
                                          </span>
                                        )}
                                        {translations[lang] &&
                                          lang !== defaultLanguage && (
                                            <span className="ml-2 text-green-600">
                                              ✓
                                            </span>
                                          )}
                                      </Select.Item>
                                    ))}
                                  </Select.Content>
                                </Select>
                              </div>
                            </div>
                          </div>
                        )}

                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <Form.Field
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <Form.Item>
                              <Form.Label>Post Type</Form.Label>
                              <Form.Control>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <Select.Trigger>
                                    <Select.Value placeholder="Choose type" />
                                  </Select.Trigger>
                                  <Select.Content>
                                    <Select.Item value="post">post</Select.Item>
                                    {customTypes.map((type: any) => (
                                      <Select.Item
                                        key={type._id}
                                        value={type._id}
                                      >
                                        {type.label}
                                      </Select.Item>
                                    ))}
                                  </Select.Content>
                                </Select>
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
                              <Form.Label>
                                Post Title
                                {selectedLanguage !== defaultLanguage && (
                                  <span className="ml-2 text-xs text-blue-600">
                                    ({selectedLanguage})
                                  </span>
                                )}
                              </Form.Label>
                              <Form.Control>
                                <Input
                                  {...field}
                                  placeholder="Post title"
                                  onChange={(e) => {
                                    field.onChange(e);
                                    const val = e.target.value;
                                    if (
                                      selectedLanguage === defaultLanguage &&
                                      !form.getValues('slug')
                                    ) {
                                      form.setValue('slug', generateSlug(val));
                                    }
                                  }}
                                />
                              </Form.Control>
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                      </div>

                      <Form.Field
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <Form.Item>
                            <Form.Label>
                              Short Description
                              {selectedLanguage !== defaultLanguage && (
                                <span className="ml-2 text-xs text-blue-600">
                                  ({selectedLanguage})
                                </span>
                              )}
                            </Form.Label>
                            <Form.Control>
                              <Textarea
                                {...field}
                                placeholder="Description here"
                                rows={8}
                                maxLength={500}
                              />
                            </Form.Control>
                            <div className="text-xs text-muted-foreground text-right">
                              {field.value?.length || 0}/500 characters
                            </div>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />

                      <Form.Field
                        control={form.control}
                        name="categoryIds"
                        render={({ field }) => (
                          <Form.Item>
                            <Form.Label>Category</Form.Label>
                            <Form.Control>
                              <MultipleSelector
                                value={categories.filter((o: any) =>
                                  (field.value || []).includes(o.value),
                                )}
                                options={categories}
                                placeholder="Select"
                                hidePlaceholderWhenSelected={true}
                                emptyIndicator="Empty"
                                onChange={(opts: any[]) =>
                                  field.onChange(opts.map((o) => o.value))
                                }
                              />
                            </Form.Control>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />

                      <Form.Field
                        control={form.control}
                        name="tagIds"
                        render={({ field }) => (
                          <Form.Item>
                            <Form.Label>Tag</Form.Label>
                            <Form.Control>
                              <MultipleSelector
                                value={tags.filter((o: any) =>
                                  (field.value || []).includes(o.value),
                                )}
                                options={tags}
                                placeholder="Select"
                                hidePlaceholderWhenSelected={true}
                                emptyIndicator="Empty"
                                onChange={(opts: any[]) =>
                                  field.onChange(opts.map((o) => o.value))
                                }
                              />
                            </Form.Control>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />

                      <Form.Field
                        control={form.control}
                        name="featured"
                        render={({ field }) => (
                          <Form.Item>
                            <Form.Label>Featured</Form.Label>
                            <Form.Description>
                              Turn this post into a featured post
                            </Form.Description>
                            <Form.Control>
                              <Switch
                                checked={!!field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Form.Control>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />

                      {selectedType && fieldGroups.length > 0 && (
                        <div className="space-y-3 mt-6 pt-6 border-t">
                          <div className="text-sm font-semibold text-foreground">
                            Custom Fields
                          </div>
                          {fieldGroups.map((group: any) => (
                            <Collapsible
                              key={group._id}
                              defaultOpen
                              className="group"
                            >
                              <Collapsible.Trigger asChild>
                                <Button
                                  variant="secondary"
                                  className="w-full justify-start"
                                >
                                  <Collapsible.TriggerIcon />
                                  {group.label}
                                </Button>
                              </Collapsible.Trigger>
                              <Collapsible.Content className="pt-4">
                                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                  {(group.fields || []).map((field: any) => (
                                    <div
                                      key={field._id}
                                      className="flex flex-col gap-2"
                                    >
                                      <Form.Label
                                        className="text-sm font-medium"
                                        htmlFor={`custom-field-${field._id}`}
                                      >
                                        {field.label}
                                        {field.isRequired && (
                                          <span className="text-destructive ml-1">
                                            *
                                          </span>
                                        )}
                                      </Form.Label>
                                      <CustomFieldInput
                                        field={field}
                                        value={getCustomFieldValue(field._id)}
                                        onChange={(value: any) =>
                                          updateCustomFieldValue(
                                            field._id,
                                            value,
                                          )
                                        }
                                      />
                                    </div>
                                  ))}
                                </div>
                              </Collapsible.Content>
                            </Collapsible>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  {activeTab === 'media' && <MediaSection form={form} />}
                </form>
              </Form>
            </div>

            <PostPreview
              content={form.watch('content') || ''}
              form={form}
              selectedLanguage={selectedLanguage}
              defaultLanguage={defaultLanguage}
              fullPost={fullPost}
              formatInitialContent={formatInitialContent}
              handleEditorChange={handleEditorChange}
            />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

const MediaSection = ({ form }: { form: any }) => (
  <div>
    <div className="mt-1 space-y-4">
      <div className="text-sm font-medium">Media</div>

      <Form.Field
        control={form.control}
        name="thumbnail"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Featured image</Form.Label>
            <Form.Description>
              Image can be shown on top of the post also in the list view
            </Form.Description>
            <Form.Control>
              <ThumbnailUploader field={field} form={form} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="gallery"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Image gallery</Form.Label>
            <Form.Description>
              Image gallery with maximum of 10 images
            </Form.Description>
            <Form.Control>
              <GalleryUploader
                value={(field.value as string[]) || []}
                onChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="video"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Video</Form.Label>
            <Form.Control>
              <VideoUploader value={field.value} onChange={field.onChange} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="audio"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Audio</Form.Label>
            <Form.Description>Can be used for audio podcast</Form.Description>
            <Form.Control>
              <AudioUploader value={field.value} onChange={field.onChange} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="documents"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Documents</Form.Label>
            <Form.Control>
              <DocumentsUploader
                value={(field.value as string[]) || []}
                onChange={field.onChange}
              />
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
              <AttachmentsUploader
                value={(field.value as string[]) || []}
                onChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  </div>
);

const ThumbnailUploader = ({ field, form }: { field: any; form: any }) => (
  <>
    <div className="flex items-center gap-3">
      <Upload.Root
        value={
          typeof field.value === 'string'
            ? field.value
            : (field.value as any)?.url || ''
        }
        onChange={(v: any) => {
          if (v && typeof v === 'object' && 'url' in v) {
            field.onChange({
              url: (v as any).url,
              name: (v as any).fileInfo?.name || '',
            });
          } else {
            field.onChange(null);
          }
        }}
      >
        <Upload.Preview />
        <div className="flex flex-col items-stretch gap-2 flex-1">
          <Upload.Button
            size="sm"
            variant="secondary"
            type="button"
            className="flex items-center justify-center gap-2"
          >
            <IconUpload size={16} />
            <span className="text-sm font-medium">
              {field.value ? 'Change image' : 'Upload featured image'}
            </span>
          </Upload.Button>
        </div>
      </Upload.Root>
    </div>
    {form.watch('thumbnail') && (
      <div className="mt-2 relative">
        <div className="relative">
          <img
            src={readImage(
              typeof form.watch('thumbnail') === 'string'
                ? form.watch('thumbnail')
                : (form.watch('thumbnail') as any)?.url || '',
            )}
            alt="Featured preview"
            className="w-full h-32 object-cover rounded border"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              form.setValue('thumbnail', null);
            }}
          >
            <IconX size={12} />
          </Button>
        </div>
      </div>
    )}
  </>
);
