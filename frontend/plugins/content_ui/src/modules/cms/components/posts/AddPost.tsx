import {
  Button,
  Form,
  Input,
  Textarea,
  toast,
  Editor,
  Select,
  MultipleSelector,
  Switch,
  Tabs,
  Upload,
  DatePicker,
  Collapsible,
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  useErxesUpload,
  Spinner,
} from 'erxes-ui';
import { readImage } from 'erxes-ui/utils/core';
import { IconUpload, IconX } from '@tabler/icons-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import { CmsLayout } from '../shared/CmsLayout';
import { useQuery, useMutation } from '@apollo/client';
import { Block } from '@blocknote/core';
import { useTags } from '../../hooks/useTags';
import {
  CMS_CATEGORIES,
  CMS_POST,
  CMS_CUSTOM_POST_TYPES,
  CMS_CUSTOM_FIELD_GROUPS,
  CONTENT_CMS_LIST,
  CMS_TRANSLATIONS,
  CMS_EDIT_TRANSLATION,
} from '../../graphql/queries';
import { usePostMutations } from '../../hooks/usePostMutations';
import { CustomFieldInput } from './CustomFieldInput';
import { GalleryUploader } from './GalleryUploader';
import { VideoUploader } from './VideoUploader';
import { AudioUploader } from './AudioUploader';
import { DocumentsUploader } from './DocumentsUploader';
import { AttachmentsUploader } from './AttachmentsUploader';
import { PostPreview } from './PostPreview';
import {
  formatInitialContent,
  makeAttachmentFromUrl,
  normalizeAttachment,
  makeAttachmentArrayFromUrls,
} from './formHelpers';

const DateTimeInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder: string;
}) => {
  const handleDateChange = (d: Date | Date[] | undefined) => {
    const picked = Array.isArray(d) ? d[0] : d;
    if (!picked) {
      onChange(undefined);
      return;
    }
    const current = value || new Date();
    const merged = new Date(picked);
    merged.setHours(current.getHours());
    merged.setMinutes(current.getMinutes());
    merged.setSeconds(0);
    merged.setMilliseconds(0);
    onChange(merged);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeValue = e.target.value;
    if (!timeValue) return;
    const [hh, mm] = timeValue.split(':').map((v) => Number.parseInt(v, 10));
    const base = value || new Date();
    const merged = new Date(base);
    merged.setHours(hh || 0);
    merged.setMinutes(mm || 0);
    merged.setSeconds(0);
    merged.setMilliseconds(0);
    onChange(merged);
  };

  const timeValue = value
    ? `${String(new Date(value).getHours()).padStart(2, '0')}:${String(
        new Date(value).getMinutes(),
      ).padStart(2, '0')}`
    : '';

  return (
    <div className="flex items-center gap-1">
      <DatePicker
        value={value}
        onChange={handleDateChange}
        placeholder={placeholder}
      />
      <input
        type="time"
        className="border rounded px-2 py-1 h-9 text-sm w-[100px]"
        value={timeValue}
        onChange={handleTimeChange}
      />
    </div>
  );
};

interface PostFormData {
  title: string;
  slug: string;
  description?: string;
  content?: string;
  type?: string;
  status?: 'draft' | 'published' | 'scheduled' | 'archived';
  categoryIds?: string[];
  tagIds?: string[];
  featured?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  thumbnail?: any | null;
  gallery?: string[];
  video?: string | null;
  audio?: string | null;
  documents?: string[];
  attachments?: string[];
  pdf?: string | null;
  scheduledDate?: Date | null;
  autoArchiveDate?: Date | null;
  enableAutoArchive?: boolean;
  customFieldsData?: { field: string; value: any }[];
}

export function AddPost() {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const editingPost = location?.state?.post as
    | {
        _id: string;
        title: string;
        slug: string;
        description?: string;
        content?: string;
        type?: string;
        status?: 'draft' | 'published' | 'archived';
        categoryIds?: string[];
        categories?: { _id: string }[];
        tagIds?: string[];
        tags?: { _id: string }[];
        featured?: boolean;
      }
    | undefined;
  const [activeTab, setActiveTab] = useState<'content' | 'media' | 'seo'>(
    'content',
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [defaultLangData, setDefaultLangData] = useState<{
    title: string;
    content: string;
    description: string;
    customFieldsData: any[];
  } | null>(null);
  const previousTypeRef = useRef<string | undefined>();

  const form = useForm<PostFormData>({
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      content: '',
      type: 'Post',
      status: 'draft',
      categoryIds: [],
      tagIds: [],
      featured: false,
      seoTitle: '',
      seoDescription: '',
      thumbnail: null,
      gallery: [],
      video: null,
      audio: null,
      documents: [],
      attachments: [],
      pdf: null,
      scheduledDate: null,
      autoArchiveDate: null,
      enableAutoArchive: false,
      customFieldsData: [],
    },
  });

  const handleEditorChange = async (value: string, editorInstance?: any) => {
    try {
      if (typeof value === 'string' && value.trim().startsWith('[')) {
        const blocks: Block[] = JSON.parse(value);
        if (editorInstance?.blocksToHTMLLossy) {
          const htmlContent = await editorInstance.blocksToHTMLLossy(
            blocks as any,
          );
          form.setValue('content', htmlContent, {
            shouldDirty: true,
            shouldTouch: true,
          });
        } else {
          const htmlContent = (blocks as any)
            .map((block: any) => {
              if (block.type === 'paragraph' && block.content) {
                const text = block.content
                  .map((i: any) => i.text || '')
                  .join('');
                return text ? `<p>${text}</p>` : '';
              }
              if (block.type === 'heading' && block.content) {
                const text = block.content
                  .map((i: any) => i.text || '')
                  .join('');
                const level = (block.props as any)?.level || 1;
                return text ? `<h${level}>${text}</h${level}>` : '';
              }
              return '';
            })
            .filter(Boolean)
            .join('');
          form.setValue('content', htmlContent, {
            shouldDirty: true,
            shouldTouch: true,
          });
        }
      } else {
        const htmlContent = value || '';
        form.setValue('content', htmlContent, {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    } catch {
      form.setValue('content', '', { shouldDirty: true, shouldTouch: true });
    }
  };

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  // Fetch full post when editing to avoid missing fields from list query
  const { data: fullPostData } = useQuery(CMS_POST, {
    variables: { id: editingPost?._id },
    skip: !editingPost?._id,
    fetchPolicy: 'cache-first',
  });

  const fullPost = (fullPostData?.cmsPost as any) || editingPost;

  // Fetch translations for editing post
  const { data: translationsData } = useQuery(CMS_TRANSLATIONS, {
    variables: { postId: editingPost?._id },
    skip: !editingPost?._id,
    fetchPolicy: 'network-only',
  });

  const [saveTranslation] = useMutation(CMS_EDIT_TRANSLATION);

  // Load translations when editing
  useEffect(() => {
    if (translationsData?.cmsTranslations) {
      const translationsMap: Record<string, any> = {};
      translationsData.cmsTranslations.forEach((t: any) => {
        translationsMap[t.language] = {
          title: t.title || '',
          content: t.content || '',
          excerpt: t.excerpt || '',
          customFieldsData: t.customFieldsData || [],
        };
      });
      setTranslations(translationsMap);
    }
  }, [translationsData]);

  useEffect(() => {
    if (fullPost) {
      const toDate = (v: any) => (v ? new Date(v) : null);
      form.reset({
        title: fullPost.title || '',
        slug: fullPost.slug || '',
        description: fullPost.excerpt || fullPost.description || '',
        content: fullPost.content || '',
        type: fullPost.type || undefined,
        status: fullPost.status || undefined,
        categoryIds:
          fullPost.categoryIds ||
          fullPost.categories?.map((c: any) => c._id) ||
          [],
        tagIds: fullPost.tagIds || fullPost.tags?.map((t: any) => t._id) || [],
        featured: !!fullPost.featured,
        seoTitle: fullPost.seoTitle || '',
        seoDescription: fullPost.seoDescription || '',
        thumbnail: fullPost.thumbnail || null,
        gallery: (fullPost.images || []).map((i: any) => i.url).filter(Boolean),
        video: (fullPost.video && fullPost.video.url) || fullPost.video || null,
        audio: (fullPost.audio && fullPost.audio.url) || fullPost.audio || null,
        documents: (fullPost.documents || [])
          .map((d: any) => d.url)
          .filter(Boolean),
        attachments: (fullPost.attachments || [])
          .map((a: any) => a.url)
          .filter(Boolean),
        pdf: fullPost.pdf || null,
        scheduledDate: toDate(fullPost.scheduledDate) || null,
        autoArchiveDate: toDate(fullPost.autoArchiveDate) || null,
        enableAutoArchive: !!fullPost.autoArchiveDate,
        customFieldsData: fullPost.customFieldsData || [],
      });
    } else {
      const title = form.getValues('title');
      if (title && !form.getValues('slug')) {
        form.setValue('slug', generateSlug(title));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullPost]);

  const { createPost, editPost, creating, saving } = usePostMutations({
    websiteId,
  });

  const onSubmit = async (data: PostFormData) => {
    // Validate that a custom post type is selected
    if (!data.type) {
      toast({
        title: 'Validation Error',
        description: 'Please select a post type',
        variant: 'destructive',
      });
      return;
    }

    const extractText = (html: string) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html || '';
      return (tmp.textContent || tmp.innerText || '').trim();
    };
    const computedTitle =
      (data.title && data.title.trim()) ||
      (data.seoTitle && data.seoTitle.trim()) ||
      extractText(data.content || '')
        .split('\n')[0]
        .slice(0, 80) ||
      'Untitled';

    // Generate unique slug from title
    const generateSlug = (title: string) => {
      const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      // Add timestamp to ensure uniqueness
      const timestamp = Date.now().toString(36).slice(-6);
      // If baseSlug is empty, use 'post' as default
      const finalSlug = baseSlug || 'post';
      return `${finalSlug}-${timestamp}`;
    };

    // Ensure slug exists
    const combinedImages = [...(data.gallery || [])];

    const imagesPayload = makeAttachmentArrayFromUrls(combinedImages);
    const videoPayload = normalizeAttachment(data.video || undefined);
    const audioPayload = normalizeAttachment(data.audio || undefined);
    const documentsPayload = makeAttachmentArrayFromUrls(data.documents || []);
    const attachmentsPayload = makeAttachmentArrayFromUrls(
      data.attachments || [],
    );
    const pdfPayload = normalizeAttachment(data.pdf || undefined);

    const input: any = {
      clientPortalId: websiteId,
      title: computedTitle,
      slug: editingPost?._id ? data.slug : generateSlug(computedTitle),
      content: data.content,
      type: data.type,
      status: data.status || 'draft',
      categoryIds: data.categoryIds,
      tagIds: data.tagIds,
      featured: data.featured,
      scheduledDate: data.scheduledDate || undefined,
      autoArchiveDate: data.enableAutoArchive
        ? data.autoArchiveDate
        : undefined,
      excerpt:
        (data.description && data.description.trim()) ||
        extractText(data.content || '').slice(0, 200),
      thumbnail: normalizeAttachment(data.thumbnail || undefined),
      images: imagesPayload.length ? imagesPayload : undefined,
      video: videoPayload,
      audio: audioPayload,
      documents: documentsPayload.length ? documentsPayload : undefined,
      attachments: attachmentsPayload.length ? attachmentsPayload : undefined,
      pdfAttachment: pdfPayload ? { pdf: pdfPayload } : undefined,
      customFieldsData: (() => {
        if (!data.customFieldsData || data.customFieldsData.length === 0) {
          return undefined;
        }
        const filtered = data.customFieldsData.filter(
          (item) =>
            item.value !== '' &&
            item.value !== null &&
            item.value !== undefined,
        );
        return filtered.length > 0 ? filtered : undefined;
      })(),
    };

    try {
      if (editingPost?._id) {
        // Save current language content to local state first
        const currentTranslations = { ...translations };
        let postInput = { ...input };

        if (selectedLanguage === defaultLanguage) {
          // Currently editing default language - use form data for post
          // postInput is already correct from form data
        } else {
          // Currently editing translation - save it and use stored default data for post
          currentTranslations[selectedLanguage] = {
            title: data.title,
            content: data.content,
            excerpt: data.description,
            customFieldsData: data.customFieldsData,
          };

          // Use stored default language data if available
          if (defaultLangData) {
            postInput = {
              ...input,
              title: defaultLangData.title || input.title,
              content: defaultLangData.content || input.content,
              excerpt: defaultLangData.description || input.excerpt,
              customFieldsData:
                defaultLangData.customFieldsData || input.customFieldsData,
            };
          }
        }

        // Update the post with default language content
        await editPost(editingPost._id, postInput);

        // Save all translations that have content
        const translationPromises = Object.entries(currentTranslations)
          .filter(
            ([lang, trans]: [string, any]) =>
              lang !== defaultLanguage && (trans?.title || trans?.content),
          )
          .map(([lang, trans]: [string, any]) =>
            saveTranslation({
              variables: {
                input: {
                  postId: editingPost._id,
                  language: lang,
                  title: trans?.title || '',
                  content: trans?.content || '',
                  excerpt: trans?.excerpt || '',
                  customFieldsData: trans?.customFieldsData || [],
                  type: 'post',
                },
              },
            }),
          );

        if (translationPromises.length > 0) {
          await Promise.all(translationPromises);
        }

        toast({ title: 'Saved', description: 'Post and translations saved' });
        navigate(`/content/cms/${websiteId}/posts`, { replace: true });
      } else {
        await createPost(input);
        toast({ title: 'Saved', description: 'Post created' });
        navigate(`/content/cms/${websiteId}/posts`, { replace: true });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save post',
        variant: 'destructive',
      });
    }
  };

  const { data: catData } = useQuery(CMS_CATEGORIES, {
    variables: { clientPortalId: websiteId || '', limit: 100 },
    skip: !websiteId,
    fetchPolicy: 'cache-first',
  });
  const categories = (catData?.cmsCategories?.list || []).map((c: any) => ({
    label: c.name,
    value: c._id,
  }));
  const { tags: tagsData } = useTags({
    clientPortalId: websiteId || '',
    limit: 100,
  });
  const tags = (tagsData || []).map((t: any) => ({
    label: t.name,
    value: t._id,
  }));

  const { data: customTypesData } = useQuery(CMS_CUSTOM_POST_TYPES, {
    variables: { clientPortalId: websiteId },
    skip: !websiteId,
  });
  const customTypes = customTypesData?.cmsCustomPostTypes || [];

  // Fetch CMS configuration to get available languages
  const { data: cmsData } = useQuery(CONTENT_CMS_LIST, {
    fetchPolicy: 'cache-first',
  });
  const cmsConfig = cmsData?.contentCMSList?.find(
    (cms: any) => cms.clientPortalId === websiteId,
  );
  const availableLanguages = cmsConfig?.languages || [];
  const defaultLanguage = cmsConfig?.language || 'en';

  // Initialize selected language with default language
  useEffect(() => {
    if (!selectedLanguage && defaultLanguage) {
      setSelectedLanguage(defaultLanguage);
    }
  }, [defaultLanguage, selectedLanguage]);

  const selectedType = form.watch('type');
  const { data: fieldGroupsData } = useQuery(CMS_CUSTOM_FIELD_GROUPS, {
    variables: { clientPortalId: websiteId },
    skip: !websiteId || !selectedType,
  });

  const fieldGroups = (
    fieldGroupsData?.cmsCustomFieldGroupList?.list || []
  ).filter(
    (group: any) =>
      !group.customPostTypeIds ||
      group.customPostTypeIds.length === 0 ||
      group.customPostTypeIds.includes(selectedType),
  );

  // Clear custom fields data when post type changes (only for new posts, not when editing)
  useEffect(() => {
    if (
      !editingPost &&
      selectedType &&
      previousTypeRef.current &&
      previousTypeRef.current !== selectedType
    ) {
      form.setValue('customFieldsData', []);
    }
    previousTypeRef.current = selectedType;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, editingPost]);

  const updateCustomFieldValue = (fieldId: string, value: any) => {
    const currentData = form.getValues('customFieldsData') || [];
    const existingIndex = currentData.findIndex(
      (item) => item.field === fieldId,
    );

    let updated;
    if (existingIndex >= 0) {
      updated = [...currentData];
      updated[existingIndex] = { field: fieldId, value };
    } else {
      updated = [...currentData, { field: fieldId, value }];
    }

    form.setValue('customFieldsData', updated, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: false,
    });
  };

  const getCustomFieldValue = (fieldId: string) => {
    const currentData = form.watch('customFieldsData') || [];
    const item = currentData.find((item) => item.field === fieldId);
    return item?.value ?? '';
  };

  const headerActions = (
    <>
      <Form {...form}>
        <div className="flex items-center gap-2">
          {form.watch('status') === 'published' && (
            <Form.Field
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <DateTimeInput
                      value={field.value || undefined}
                      onChange={field.onChange}
                      placeholder="Нийтлэх огноо"
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          )}

          {form.watch('status') === 'scheduled' && (
            <Form.Field
              control={form.control}
              name="scheduledDate"
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <DateTimeInput
                      value={field.value || undefined}
                      onChange={field.onChange}
                      placeholder="Товлосон огноо"
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          )}

          {(form.watch('status') === 'published' ||
            form.watch('status') === 'scheduled') && (
            <Form.Field
              control={form.control}
              name="enableAutoArchive"
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        Auto archive
                      </span>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  </Form.Control>
                </Form.Item>
              )}
            />
          )}

          {form.watch('enableAutoArchive') &&
            (form.watch('status') === 'published' ||
              form.watch('status') === 'scheduled') && (
              <Form.Field
                control={form.control}
                name="autoArchiveDate"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Control>
                      <DateTimeInput
                        value={field.value || undefined}
                        onChange={field.onChange}
                        placeholder="Archive date"
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />
            )}

          <Form.Field
            control={form.control}
            name="status"
            render={({ field }) => (
              <Form.Item>
                <Form.Control>
                  <div className="inline-flex items-center rounded-md border bg-background p-1 gap-1">
                    <Button
                      type="button"
                      variant={
                        field.value === 'published' ? 'default' : 'ghost'
                      }
                      size="sm"
                      onClick={() => field.onChange('published')}
                      className="h-8"
                    >
                      Publish
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 'draft' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => field.onChange('draft')}
                      className="h-8"
                    >
                      Draft
                    </Button>
                    <Button
                      type="button"
                      variant={
                        field.value === 'scheduled' ? 'default' : 'ghost'
                      }
                      size="sm"
                      onClick={() => field.onChange('scheduled')}
                      className="h-8"
                    >
                      Scheduled
                    </Button>
                  </div>
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>
      </Form>
      <Button
        onClick={() => form.handleSubmit(onSubmit)()}
        disabled={creating || saving}
      >
        {creating || saving ? (
          <>
            <Spinner size="sm" className="mr-2" />
            {form.watch('status') === 'published'
              ? 'Publishing...'
              : form.watch('status') === 'draft'
              ? 'Saving...'
              : form.watch('status') === 'scheduled'
              ? 'Scheduling...'
              : 'Saving...'}
          </>
        ) : (
          <>
            {form.watch('status') === 'published'
              ? 'Publish'
              : form.watch('status') === 'draft'
              ? 'Save Draft'
              : form.watch('status') === 'scheduled'
              ? 'Schedule'
              : 'Save'}
          </>
        )}
      </Button>
    </>
  );

  return (
    <CmsLayout headerActions={headerActions}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">New Post</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border overflow-hidden">
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
                  {/* <Tabs.Trigger value="seo" className="w-full">
                    SEO
                  </Tabs.Trigger> */}
                </div>
              </Tabs.List>
            </Tabs>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="p-4 space-y-4"
            >
              {activeTab === 'content' && (
                <>
                  {/* Language Selector */}
                  {editingPost?._id && availableLanguages.length > 0 && (
                    <div className="space-y-3 p-2 rounded-md border">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">
                            Language:
                          </span>
                          <Select
                            value={selectedLanguage}
                            onValueChange={(lang) => {
                              if (lang === selectedLanguage) return;

                              // Save current content to local state (fast, no server call)
                              if (selectedLanguage === defaultLanguage) {
                                // Save default language content
                                setDefaultLangData({
                                  title: form.getValues('title') || '',
                                  content: form.getValues('content') || '',
                                  description:
                                    form.getValues('description') || '',
                                  customFieldsData:
                                    form.getValues('customFieldsData') || [],
                                });
                              } else {
                                // Save translation content
                                setTranslations((prev) => ({
                                  ...prev,
                                  [selectedLanguage]: {
                                    title: form.getValues('title'),
                                    content: form.getValues('content'),
                                    excerpt: form.getValues('description'),
                                    customFieldsData:
                                      form.getValues('customFieldsData'),
                                  },
                                }));
                              }

                              // Load content for new language
                              if (lang === defaultLanguage) {
                                // Load default language (from local state if edited, otherwise from server)
                                const data = defaultLangData || {
                                  title: fullPost?.title || '',
                                  content: fullPost?.content || '',
                                  description:
                                    fullPost?.excerpt ||
                                    fullPost?.description ||
                                    '',
                                  customFieldsData:
                                    fullPost?.customFieldsData || [],
                                };
                                form.setValue('title', data.title);
                                form.setValue('content', data.content);
                                form.setValue('description', data.description);
                                form.setValue(
                                  'customFieldsData',
                                  data.customFieldsData,
                                );
                              } else {
                                const translation = translations[lang];
                                form.setValue(
                                  'title',
                                  translation?.title || '',
                                );
                                form.setValue(
                                  'content',
                                  translation?.content || '',
                                );
                                form.setValue(
                                  'description',
                                  translation?.excerpt || '',
                                );
                                form.setValue(
                                  'customFieldsData',
                                  translation?.customFieldsData || [],
                                );
                              }

                              setSelectedLanguage(lang);
                            }}
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
                                <Select.Item value="Post">Post</Select.Item>
                                {customTypes.map((type: any) => (
                                  <Select.Item key={type._id} value={type._id}>
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

                  {/* Category */}
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

                  {/* Tag */}
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

                  {/* Featured */}
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

                  {/* Custom Fields - erxes standard UI */}
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
                                    onChange={(value) =>
                                      updateCustomFieldValue(field._id, value)
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

                  {/* moved media fields into Media tab */}
                </>
              )}
              {activeTab === 'media' && (
                <>
                  <div className="mt-1 space-y-4">
                    <div className="text-sm font-medium">Media</div>

                    <Form.Field
                      control={form.control}
                      name="thumbnail"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Featured image</Form.Label>
                          <Form.Description>
                            Image can be shown on the top of the post also in
                            the list view
                          </Form.Description>
                          <Form.Control>
                            <div className="flex items-center gap-3">
                              <Upload.Root
                                value={
                                  typeof field.value === 'string'
                                    ? field.value
                                    : (field.value as any)?.url || ''
                                }
                                onChange={(v: any) => {
                                  if (
                                    v &&
                                    typeof v === 'object' &&
                                    'url' in v
                                  ) {
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
                                      {field.value
                                        ? 'Change image'
                                        : 'Upload featured image'}
                                    </span>
                                  </Upload.Button>
                                </div>
                              </Upload.Root>
                            </div>
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />

                    {/* Preview uploaded featured image (thumbnail) */}
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
                            <VideoUploader
                              value={field.value}
                              onChange={field.onChange}
                            />
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
                          <Form.Description>
                            Can be used for audio podcast
                          </Form.Description>
                          <Form.Control>
                            <AudioUploader
                              value={field.value}
                              onChange={field.onChange}
                            />
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

                    {/* <Form.Field
                      control={form.control}
                      name="pdf"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Newspaper & Magazine</Form.Label>
                          <Form.Description>
                            Pages of PDF file will be turned into images
                          </Form.Description>
                          <Form.Control>
                            <div className="space-y-2">
                              {!field.value && (
                                <Upload.Root
                                  value={field.value || ''}
                                  onChange={(v: any) =>
                                    field.onChange(v?.url || null)
                                  }
                                >
                                  <Upload.Preview className="hidden" />
                                  <Upload.Button
                                    size="sm"
                                    variant="secondary"
                                    type="button"
                                    className="flex flex-col items-center justify-center w-full h-20 border border-dashed text-muted-foreground"
                                  >
                                    <IconUpload />
                                    <span className="text-sm font-medium">
                                      Upload a PDF
                                    </span>
                                  </Upload.Button>
                                </Upload.Root>
                              )}
                              {field.value && (
                                <div className="relative border rounded p-3 bg-gray-50">
                                  <div className="flex items-center gap-2">
                                    <svg
                                      className="w-8 h-8 text-red-600"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        PDF Document
                                      </p>
                                      <a
                                        href={field.value}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-blue-600 hover:underline truncate block"
                                      >
                                        {field.value}
                                      </a>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 bg-white hover:bg-gray-100"
                                    type="button"
                                    onClick={() => field.onChange(null)}
                                  >
                                    <IconX size={16} />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    /> */}
                  </div>
                </>
              )}
              {/* {activeTab === 'seo' && (
                <>
                  <Form.Field
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Slug</Form.Label>
                        <Form.Control>
                          <Input {...field} placeholder="Slug title" />
                        </Form.Control>
                        <Form.Description>
                          A slug boosts SEO, enhances readability, and ensures
                          unique URLs.
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="seoTitle"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>SEO</Form.Label>
                        <Form.Control>
                          <Input {...field} placeholder="SEO" />
                        </Form.Control>
                        <Form.Description>
                          Seo improves visibility, relevance, and user
                          experience in search results.
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="seoDescription"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Description</Form.Label>
                        <Form.Control>
                          <Textarea
                            {...field}
                            placeholder="Description here"
                            rows={3}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="thumbnail"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Thumbnail image</Form.Label>
                        <Form.Control>
                          <Upload.Root
                            value={field.value || ''}
                            onChange={(v: any) => onUploadThumbnail(v?.url)}
                          >
                            <Upload.Preview className="hidden" />
                            <Upload.Button
                              size="sm"
                              variant="secondary"
                              type="button"
                              className="flex flex-col items-center justify-center w-full h-20 border border-dashed text-muted-foreground"
                            >
                              <IconUpload />
                              <span className="text-sm font-medium">
                                Upload image
                              </span>
                            </Upload.Button>
                          </Upload.Root>
                        </Form.Control>
                        <Form.Description>
                          Max size: 15MB, File type: PNG, JPG
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </>
              )} */}

              {/* <div className="flex justify-between pt-2">
                <Button type="submit" disabled={creating || saving}>
                  {creating || saving ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      {editingPost ? 'Updating...' : 'Publishing...'}
                    </>
                  ) : (
                    <>{editingPost ? 'Update' : 'Publish'}</>
                  )}
                </Button>
              </div> */}
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

      {/* Content Editor - Full Width Section */}
    </CmsLayout>
  );
}
