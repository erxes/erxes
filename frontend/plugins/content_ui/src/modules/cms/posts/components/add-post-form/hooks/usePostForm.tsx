import { useForm } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Block } from '@blocknote/core';

import {
  CMS_POST,
  CMS_TRANSLATIONS,
  CMS_EDIT_TRANSLATION,
} from '../../../../graphql/queries';

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

export const usePostForm = (editingPost?: any) => {
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

  const { data: fullPostData } = useQuery(CMS_POST, {
    variables: { id: editingPost?._id },
    skip: !editingPost?._id,
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: false,
  });

  const fullPost = (fullPostData?.cmsPost as any) || editingPost;

  const { data: translationsData } = useQuery(CMS_TRANSLATIONS, {
    variables: { postId: editingPost?._id },
    skip: !editingPost?._id,
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: false,
  });

  const [saveTranslation] = useMutation(CMS_EDIT_TRANSLATION);

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

  return {
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
    saveTranslation,
    updateCustomFieldValue,
    getCustomFieldValue,
  };
};
