// Editor helpers: convert initial HTML -> blocks JSON, and onChange blocks -> HTML
const convertHTMLToBlocks = (htmlContent: string): Block[] => {
  if (!htmlContent || htmlContent.trim() === '') {
    return [
      {
        id: crypto.randomUUID(),
        type: 'paragraph',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        },
        content: [],
        children: [],
      } as any,
    ];
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');
  const container = doc.body;
  const blocks: Block[] = [] as any;
  const children = Array.from(container.children);
  if (children.length === 0) {
    const textContent = container.textContent || container.innerText || '';
    if (textContent.trim()) {
      blocks.push({
        id: crypto.randomUUID(),
        type: 'paragraph',
        props: {
          textColor: 'default',
          backgroundColor: 'default',
          textAlignment: 'left',
        } as any,
        content: [{ type: 'text', text: textContent, styles: {} } as any],
        children: [],
      } as any);
    }
  } else {
    children.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const textContent = el.textContent || '';
      if (!textContent.trim()) return;
      let blockType: any = 'paragraph';
      const props: any = {
        textColor: 'default',
        backgroundColor: 'default',
        textAlignment: 'left',
      };
      if (tag.match(/^h[1-6]$/)) {
        blockType = 'heading';
        props.level = parseInt(tag.charAt(1));
      }
      blocks.push({
        id: crypto.randomUUID(),
        type: blockType,
        props,
        content: [{ type: 'text', text: textContent, styles: {} }],
        children: [],
      } as any);
    });
  }
  return blocks.length > 0
    ? (blocks as any)
    : ([
        {
          id: crypto.randomUUID(),
          type: 'paragraph',
          props: {
            textColor: 'default',
            backgroundColor: 'default',
            textAlignment: 'left',
          },
          content: [],
          children: [],
        },
      ] as any);
};

const formatInitialContent = (content?: string): string | undefined => {
  if (!content || content.trim() === '') return undefined;
  if (content.startsWith('[')) {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return content;
    } catch {}
  }
  if (content.includes('<') && content.includes('>')) {
    const blocks = convertHTMLToBlocks(content);
    return JSON.stringify(blocks);
  }
  const blocks = convertHTMLToBlocks(`<p>${content}</p>`);
  return JSON.stringify(blocks);
};

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
} from 'erxes-ui';
import { IconUpload, IconChevronDown } from '@tabler/icons-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { CmsLayout } from '../shared/CmsLayout';
import { useMutation } from '@apollo/client';
import {
  POSTS_ADD,
  CMS_POSTS_EDIT,
  POST_LIST,
  CMS_CATEGORIES,
  CMS_POST,
} from '../../graphql/queries';
import { useQuery } from '@apollo/client';
import { Block } from '@blocknote/core';
import { useTags } from '../../hooks/useTags';

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
  thumbnail?: string | null;
  featuredImage?: string | null;
  gallery?: string[];
  video?: string | null;
  audio?: string | null;
  documents?: string[];
  attachments?: string[];
  pdf?: string | null;
  scheduledDate?: Date | null;
  autoArchiveDate?: Date | null;
  enableAutoArchive?: boolean;
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
  const [previewDevice, setPreviewDevice] = useState<
    'desktop' | 'tablet' | 'mobile'
  >('desktop');
  const [mediaOpen, setMediaOpen] = useState(false);

  const form = useForm<PostFormData>({
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      content: '',
      type: undefined,
      status: undefined,
      categoryIds: [],
      tagIds: [],
      featured: false,
      seoTitle: '',
      seoDescription: '',
      thumbnail: null,
      featuredImage: null,
      gallery: [],
      video: null,
      audio: null,
      documents: [],
      attachments: [],
      pdf: null,
      scheduledDate: null,
      autoArchiveDate: null,
      enableAutoArchive: false,
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
        thumbnail:
          (fullPost.thumbnail && fullPost.thumbnail.url) ||
          fullPost.thumbnail ||
          null,
        featuredImage:
          (fullPost.images && fullPost.images[0]?.url) ||
          fullPost.featuredImage ||
          null,
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
      });
    } else {
      const title = form.getValues('title');
      if (title && !form.getValues('slug')) {
        form.setValue('slug', generateSlug(title));
      }
    }
  }, [fullPost]);

  const [createPost, { loading: creating }] = useMutation(POSTS_ADD, {
    refetchQueries: [
      {
        query: POST_LIST,
        variables: {
          clientPortalId: websiteId,
          type: 'post',
          limit: 20,
        },
      },
    ],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast({ title: 'Saved', description: 'Post created' });
      navigate(`/content/cms/${websiteId}/posts`);
    },
  });

  const [editPost, { loading: savingEdit }] = useMutation(CMS_POSTS_EDIT, {
    refetchQueries: [
      {
        query: POST_LIST,
        variables: {
          clientPortalId: websiteId,
          type: 'post',
          limit: 20,
        },
      },
    ],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast({ title: 'Saved', description: 'Post updated' });
      navigate(`/content/cms/${websiteId}/posts`);
    },
  });

  const onSubmit = async (data: PostFormData) => {
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
    // Ensure slug exists
    const ensuredSlug = data.slug || generateSlug(computedTitle);
    const input: any = {
      clientPortalId: websiteId,
      title: computedTitle,
      slug: ensuredSlug,
      content: data.content,
      type: data.type,
      status: data.status,
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
      thumbnail: data.thumbnail || undefined,
      images: (data.gallery || []).length ? data.gallery : undefined,
      featuredImage: data.featuredImage || undefined,
      video: data.video || undefined,
      audio: data.audio || undefined,
      documents: (data.documents || []).length ? data.documents : undefined,
      attachments: (data.attachments || []).length
        ? data.attachments
        : undefined,
      pdf: data.pdf || undefined,
    };

    if (editingPost?._id) {
      await editPost({ variables: { id: editingPost._id, input } });
    } else {
      await createPost({ variables: { input } });
    }
  };

  const onUploadThumbnail = (url?: string) => {
    form.setValue('thumbnail', url || null, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const Preview = () => {
    const deviceDims =
      previewDevice === 'desktop'
        ? { width: 1024, height: 768 }
        : previewDevice === 'tablet'
        ? { width: 768, height: 1024 }
        : { width: 320, height: 620 };

    return (
      <div className="flex-1 flex flex-col  items-center justify-start gap-4">
        <Tabs
          value={previewDevice}
          onValueChange={(v) =>
            setPreviewDevice(v as 'desktop' | 'tablet' | 'mobile')
          }
        >
          <Tabs.List>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Tabs.Trigger value="desktop">Desktop</Tabs.Trigger>
              <Tabs.Trigger value="tablet">Tablet</Tabs.Trigger>
              <Tabs.Trigger value="mobile">Mobile</Tabs.Trigger>
            </div>
          </Tabs.List>
        </Tabs>
        <div
          className="rounded-[36px] bg-indigo-200/80 relative shadow-inner"
          style={{
            width: '100%',
            maxWidth: deviceDims.width,
            aspectRatio: `${deviceDims.width} / ${deviceDims.height}`,
          }}
        >
          <div className="absolute inset-4 bg-white rounded-[28px] p-4 overflow-hidden">
            <div className="text-xs text-gray-500 mb-2">
              Preview ({previewDevice})
            </div>
            <div className="border rounded-md p-3">
              <div className="text-xs font-semibold text-indigo-700 mb-2">
                {form.watch('seoTitle') || 'Post title'}
              </div>
              <div className="text-xl font-bold mb-2">
                {form.watch('title') || 'New Post'}
              </div>
              <div className="text-sm text-gray-700 line-clamp-6">
                {form.watch('description') || 'Post excerpt will appear here.'}
              </div>
              <div
                className="prose prose-sm max-w-none mt-2 h-44 overflow-auto"
                dangerouslySetInnerHTML={{
                  __html: form.watch('content') || '',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
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

  const headerActions = (
    <>
      <Button
        onClick={() => form.handleSubmit(onSubmit)()}
        disabled={creating || savingEdit}
      >
        {editingPost ? 'Save' : 'Create'}
      </Button>
    </>
  );

  return (
    <CmsLayout headerActions={headerActions}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">New Post</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border overflow-hidden">
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
                  <Tabs.Trigger value="seo" className="w-full">
                    SEO
                  </Tabs.Trigger>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Field
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Post</Form.Label>
                          <Form.Control>
                            <Input
                              {...field}
                              placeholder="Post title"
                              onChange={(e) => {
                                field.onChange(e);
                                const val = e.target.value;
                                if (!form.getValues('slug')) {
                                  form.setValue('slug', generateSlug(val));
                                }
                              }}
                            />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                    <Form.Field
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Type</Form.Label>
                          <Form.Control>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <Select.Trigger>
                                <Select.Value placeholder="Choose type" />
                              </Select.Trigger>
                              <Select.Content>
                                <Select.Item value="post">Post</Select.Item>
                                <Select.Item value="page">Page</Select.Item>
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
                    name="description"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Description</Form.Label>
                        <Form.Control>
                          <Textarea
                            {...field}
                            placeholder="Description here"
                            rows={4}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="content"
                    render={() => (
                      <Form.Item>
                        <Form.Label>Content</Form.Label>
                        <Form.Control>
                          <Editor
                            key={`editor-${fullPost?._id || 'new'}-${
                              (fullPost?.content || '').length
                            }`}
                            initialContent={formatInitialContent(
                              form.getValues('content') ||
                                fullPost?.content ||
                                '',
                            )}
                            onChange={handleEditorChange}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  {/* Status */}
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
                              <Select.Value placeholder="Select" />
                            </Select.Trigger>
                            <Select.Content>
                              <Select.Item value="draft">Draft</Select.Item>
                              <Select.Item value="published">
                                Published
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

                  {(form.watch('status') === 'published' ||
                    form.watch('status') === 'scheduled') && (
                    <Form.Field
                      control={form.control}
                      name="scheduledDate"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>
                            {form.watch('status') === 'published'
                              ? 'Publish date'
                              : 'Scheduled date'}
                          </Form.Label>
                          <Form.Control>
                            <DatePicker
                              value={field.value || undefined}
                              onChange={(d) => field.onChange(d as Date)}
                              placeholder={
                                form.watch('status') === 'published'
                                  ? 'Pick publish date'
                                  : 'Pick schedule date'
                              }
                              withPresent
                            />
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  )}

                  {(form.watch('status') === 'published' ||
                    form.watch('status') === 'scheduled') && (
                    <>
                      {/* Enable auto archive toggle */}
                      <Form.Field
                        control={form.control}
                        name="enableAutoArchive"
                        render={({ field }) => (
                          <Form.Item>
                            <div className="flex items-center gap-2">
                              <Form.Label>Enable auto archive</Form.Label>
                              <Form.Control>
                                <Switch
                                  checked={!!field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </Form.Control>
                            </div>
                            <Form.Message />
                          </Form.Item>
                        )}
                      />

                      {form.watch('enableAutoArchive') && (
                        <Form.Field
                          control={form.control}
                          name="autoArchiveDate"
                          render={({ field }) => (
                            <Form.Item>
                              <Form.Label>Auto archive date</Form.Label>
                              <Form.Control>
                                <DatePicker
                                  value={field.value || undefined}
                                  onChange={(d) => field.onChange(d as Date)}
                                  placeholder="Pick auto archive date"
                                  withPresent
                                />
                              </Form.Control>
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                      )}
                    </>
                  )}

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

                  {/* moved media fields into Media tab */}
                </>
              )}
              {activeTab === 'media' && (
                <>
                  <div className="mt-1 space-y-4">
                    <div className="text-sm font-medium">Media</div>

                    <Form.Field
                      control={form.control}
                      name="featuredImage"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Featured image</Form.Label>
                          <Form.Description>
                            Image can be shown on the top of the post also in
                            the list view
                          </Form.Description>
                          <Form.Control>
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
                                  Upload featured image
                                </span>
                              </Upload.Button>
                            </Upload.Root>
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
                            <div className="space-y-2">
                              <Upload.Root
                                value={''}
                                onChange={(v: any) => {
                                  const current = field.value || [];
                                  if ((current as string[]).length >= 10)
                                    return;
                                  field.onChange(
                                    [...(current as string[]), v?.url].filter(
                                      Boolean,
                                    ),
                                  );
                                }}
                              >
                                <Upload.Preview className="hidden" />
                                <Upload.Button
                                  size="sm"
                                  variant="secondary"
                                  type="button"
                                  className="flex flex-col items-center justify-center w-full h-20 border border-dashed text-muted-foreground"
                                  disabled={(field.value || []).length >= 10}
                                >
                                  <IconUpload />
                                  <span className="text-sm font-medium">
                                    Upload images
                                  </span>
                                </Upload.Button>
                              </Upload.Root>
                              {(field.value || []).length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                  {(field.value as string[]).map((url, idx) => (
                                    <div
                                      key={idx}
                                      className="relative border rounded"
                                    >
                                      <img
                                        src={url}
                                        alt=""
                                        className="w-full h-24 object-cover rounded"
                                      />
                                      <div className="absolute top-1 right-1">
                                        <Upload.Root
                                          value={url}
                                          onChange={() => {
                                            const next = (
                                              field.value as string[]
                                            ).filter((u) => u !== url);
                                            field.onChange(next);
                                          }}
                                        >
                                          <Upload.RemoveButton
                                            size="sm"
                                            variant="secondary"
                                          />
                                        </Upload.Root>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
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
                                  Upload video
                                </span>
                              </Upload.Button>
                            </Upload.Root>
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
                                  Upload audio
                                </span>
                              </Upload.Button>
                            </Upload.Root>
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
                            <div className="space-y-2">
                              <Upload.Root
                                value={''}
                                onChange={(v: any) =>
                                  field.onChange(
                                    [...(field.value || []), v?.url].filter(
                                      Boolean,
                                    ),
                                  )
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
                                    Upload documents
                                  </span>
                                </Upload.Button>
                              </Upload.Root>
                              {(field.value || []).length > 0 && (
                                <div className="space-y-1 text-sm text-gray-700">
                                  {(field.value as string[]).map((url, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between border rounded px-2 py-1"
                                    >
                                      <span className="truncate mr-2">
                                        {url}
                                      </span>
                                      <Upload.Root
                                        value={url}
                                        onChange={() => {
                                          const next = (
                                            field.value as string[]
                                          ).filter((u) => u !== url);
                                          field.onChange(next);
                                        }}
                                      >
                                        <Upload.RemoveButton
                                          size="sm"
                                          variant="secondary"
                                        />
                                      </Upload.Root>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
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
                              <Upload.Root
                                value={''}
                                onChange={(v: any) =>
                                  field.onChange(
                                    [...(field.value || []), v?.url].filter(
                                      Boolean,
                                    ),
                                  )
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
                                    Upload attachments
                                  </span>
                                </Upload.Button>
                              </Upload.Root>
                              {(field.value || []).length > 0 && (
                                <div className="space-y-1 text-sm text-gray-700">
                                  {(field.value as string[]).map((url, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between border rounded px-2 py-1"
                                    >
                                      <span className="truncate mr-2">
                                        {url}
                                      </span>
                                      <Upload.Root
                                        value={url}
                                        onChange={() => {
                                          const next = (
                                            field.value as string[]
                                          ).filter((u) => u !== url);
                                          field.onChange(next);
                                        }}
                                      >
                                        <Upload.RemoveButton
                                          size="sm"
                                          variant="secondary"
                                        />
                                      </Upload.Root>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />

                    <Form.Field
                      control={form.control}
                      name="pdf"
                      render={({ field }) => (
                        <Form.Item>
                          <Form.Label>Newspaper & Magazine</Form.Label>
                          <Form.Description>
                            Pages of PDF file will be turned into images
                          </Form.Description>
                          <Form.Control>
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
                          </Form.Control>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  </div>
                </>
              )}
              {activeTab === 'seo' && (
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
              )}

              <div className="flex justify-between pt-2">
                <Button variant="outline">Delete</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Form>
        </div>

        <Preview />
      </div>
    </CmsLayout>
  );
}
