import { useForm } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';
import { PAGE_DETAIL } from '../../../graphql/queries/pageDetailQuery';
import {
  CMS_TRANSLATIONS,
  CMS_EDIT_TRANSLATION,
} from '~/modules/cms/graphql/queries';
import { useMutation } from '@apollo/client';

export interface PageFormData {
  name: string;
  slug: string;
  description?: string;
  content?: string;
  status?: string;
  parentId?: string;
  thumbnail?: any | null;
  gallery?: string[];
  video?: string | null;
  videoUrl?: string;
  audio?: string | null;
  documents?: string[];
  attachments?: string[];
  pdf?: string | null;
  customFieldsData?: { field: string; value: any }[];
}

export const usePageForm = (editingPage?: any) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [defaultLangData, setDefaultLangData] = useState<{
    name: string;
    content: string;
    description: string;
    customFieldsData: any[];
  } | null>(null);

  const form = useForm<PageFormData>({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      content: '',
      status: 'active',
      parentId: '',
      thumbnail: null,
      gallery: [],
      video: null,
      videoUrl: '',
      audio: null,
      documents: [],
      attachments: [],
      pdf: null,
      customFieldsData: [],
    },
  });

  const handleEditorChange = (value: string) => {
    form.setValue('content', value, { shouldDirty: true, shouldTouch: true });
  };

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const { data: fullPageData } = useQuery(PAGE_DETAIL, {
    variables: { id: editingPage?._id },
    skip: !editingPage?._id,
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: false,
  });

  const fullPage = (fullPageData?.cmsPage as any) || editingPage;

  const { data: translationsData } = useQuery(CMS_TRANSLATIONS, {
    variables: { postId: editingPage?._id },
    skip: !editingPage?._id,
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
    if (fullPage) {
      form.reset({
        name: fullPage.name || '',
        slug: fullPage.slug || '',
        description: fullPage.description || '',
        content: fullPage.content || '',
        status: fullPage.status || 'active',
        parentId: fullPage.parentId || '',
        thumbnail: fullPage.thumbnail || null,
        gallery: (fullPage.pageImages || [])
          .map((i: any) => i.url)
          .filter(Boolean),
        video: (fullPage.video && fullPage.video.url) || fullPage.video || null,
        videoUrl: fullPage.videoUrl || '',
        audio: (fullPage.audio && fullPage.audio.url) || fullPage.audio || null,
        documents: (fullPage.documents || [])
          .map((d: any) => d.url)
          .filter(Boolean),
        attachments: (fullPage.attachments || [])
          .map((a: any) => a.url)
          .filter(Boolean),
        customFieldsData: fullPage.customFieldsData || [],
      });
    } else {
      const name = form.getValues('name');
      if (name && !form.getValues('slug')) {
        form.setValue('slug', generateSlug(name));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullPage]);

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
    handleEditorChange,
    generateSlug,
    fullPage,
    saveTranslation,
    updateCustomFieldValue,
    getCustomFieldValue,
  };
};
