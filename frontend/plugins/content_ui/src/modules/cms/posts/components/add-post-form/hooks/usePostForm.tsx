import { useForm } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { CustomFieldValue } from '../../../CustomFieldInput';

import {
  CMS_POST,
  CMS_TRANSLATIONS,
  CMS_EDIT_TRANSLATION,
} from '../../../../graphql/queries';
import { createSlug } from '../../../../utils/createSlug';
import { compactList } from '../../../../shared/utils';
import type { PostQuery } from '~/gql/graphql';
import {
  CustomFieldEntry,
  toCustomFieldEntries,
} from '../../../../custom-fields/utils/toCustomFieldEntries';

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
  thumbnail?: { url: string; name?: string; type?: string } | null;
  gallery?: string[];
  videoUrl?: string;
  documents?: string[];
  attachments?: string[];
  pdf?: string | null;
  publishDate?: Date | null;
  scheduledDate?: Date | null;
  autoArchiveDate?: Date | null;
  enableAutoArchive?: boolean;
  customFieldsData?: { field: string; value: CustomFieldValue }[];
}

// A post as loaded by the CMS_POST detail query; before it resolves, only the
// editing post's _id is known.
type TLoadedPost = Partial<NonNullable<PostQuery['cmsPost']>>;

/** Converts an API date value to a Date for the form, or null when absent. */
const toDate = (value: string | Date | null | undefined) =>
  value ? new Date(value) : null;

/** Extracts the attachment URLs from a loaded post's attachment list. */
const toUrls = (items?: ({ url: string } | null)[] | null) =>
  compactList(items)
    .map((item) => item.url)
    .filter(Boolean);

/** Maps a loaded post's media fields to their form values. */
const buildMediaFormValues = (fullPost: TLoadedPost) => ({
  thumbnail: fullPost.thumbnail
    ? {
        url: fullPost.thumbnail.url,
        name: fullPost.thumbnail.name ?? undefined,
        type: fullPost.thumbnail.type ?? undefined,
      }
    : null,
  gallery: toUrls(fullPost.images),
  videoUrl: fullPost.videoUrl || '',
  documents: toUrls(fullPost.documents),
  attachments: toUrls(fullPost.attachments),
  pdf: null,
});

/** Maps a loaded post's scheduling fields to their form values. */
const buildScheduleFormValues = (fullPost: TLoadedPost) => ({
  publishDate: toDate(fullPost.publishedDate),
  scheduledDate: toDate(fullPost.scheduledDate),
  autoArchiveDate: toDate(fullPost.autoArchiveDate),
  enableAutoArchive: Boolean(fullPost.autoArchiveDate),
});

/** Maps a loaded post to the full set of form values used on reset. */
const buildPostFormValues = (fullPost: TLoadedPost): PostFormData => ({
  title: fullPost.title || '',
  slug: fullPost.slug || '',
  description: fullPost.excerpt || '',
  content: fullPost.content || '',
  type: fullPost.type || undefined,
  status: fullPost.status || undefined,
  categoryIds: fullPost.categoryIds
    ? compactList(fullPost.categoryIds)
    : compactList(fullPost.categories).map((c) => c._id),
  tagIds: compactList(fullPost.tagIds),
  featured: Boolean(fullPost.featured),
  seoTitle: fullPost.seoTitle || '',
  seoDescription: fullPost.seoDescription || '',
  customFieldsData: toCustomFieldEntries(fullPost.customFieldsData),
  ...buildMediaFormValues(fullPost),
  ...buildScheduleFormValues(fullPost),
});

export const usePostForm = (editingPost?: { _id: string }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [translations, setTranslations] = useState<
    Record<
      string,
      {
        title: string;
        content: string;
        excerpt: string;
        customFieldsData: CustomFieldEntry[];
      }
    >
  >({});
  const [defaultLangData, setDefaultLangData] = useState<{
    title: string;
    content: string;
    excerpt: string;
    customFieldsData: CustomFieldEntry[];
  } | null>(null);
  const previousTypeRef = useRef<string | undefined>();
  const lastResetKeyRef = useRef<string | undefined>();

  const form = useForm<PostFormData>({
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      content: '',
      type: 'post',
      status: 'draft',
      categoryIds: [],
      tagIds: [],
      featured: false,
      seoTitle: '',
      seoDescription: '',
      thumbnail: null,
      gallery: [],
      videoUrl: '',
      documents: [],
      attachments: [],
      pdf: null,
      publishDate: null,
      scheduledDate: null,
      autoArchiveDate: null,
      enableAutoArchive: false,
      customFieldsData: [],
    },
  });

  const handleEditorChange = (value: string) => {
    form.setValue('content', value, { shouldDirty: true, shouldTouch: true });
  };

  const { data: fullPostData } = useQuery(CMS_POST, {
    variables: { id: editingPost?._id },
    skip: !editingPost?._id,
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: false,
  });

  const fullPost: TLoadedPost | undefined =
    fullPostData?.cmsPost || editingPost;

  const { data: translationsData } = useQuery(CMS_TRANSLATIONS, {
    variables: { objectId: editingPost?._id, type: 'post' },
    skip: !editingPost?._id,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: false,
  });

  const [saveTranslation] = useMutation(CMS_EDIT_TRANSLATION);

  useEffect(() => {
    if (translationsData?.cmsTranslations) {
      const translationsMap: Record<
        string,
        {
          title: string;
          content: string;
          excerpt: string;
          customFieldsData: CustomFieldEntry[];
        }
      > = {};
      compactList(translationsData.cmsTranslations).forEach((t) => {
        if (!t.language) return;
        translationsMap[t.language] = {
          title: t.title || '',
          content: t.content || '',
          excerpt: t.excerpt || '',
          customFieldsData: toCustomFieldEntries(t.customFieldsData),
        };
      });
      setTranslations(translationsMap);
    }
  }, [translationsData]);

  useEffect(() => {
    if (fullPost) {
      // Reset only when the loaded post (or its load phase: partial list row →
      // full cmsPost) changes. Refetches triggered by saves return a new object
      // with the same data — resetting on those would clobber in-flight typing.
      const resetKey = `${fullPost._id}:${
        fullPost === fullPostData?.cmsPost ? 'full' : 'partial'
      }`;

      if (lastResetKeyRef.current === resetKey) {
        return;
      }
      lastResetKeyRef.current = resetKey;

      form.reset(buildPostFormValues(fullPost));
    } else {
      const title = form.getValues('title');
      if (title && !form.getValues('slug')) {
        form.setValue('slug', createSlug(title));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullPost]);

  const updateCustomFieldValue = (fieldId: string, value: CustomFieldValue) => {
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
    fullPost,
    saveTranslation,
    updateCustomFieldValue,
    getCustomFieldValue,
  };
};
