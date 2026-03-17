import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { PAGE_DETAIL } from '../../../graphql/queries/pageDetailQuery';
import {
  CMS_TRANSLATIONS,
  CMS_EDIT_TRANSLATION,
} from '~/modules/cms/graphql/queries';

interface IAttachment {
  url: string;
  name?: string;
  type?: string;
  size?: number;
  duration?: number;
}

interface ICustomFieldData {
  field: string;
  value: unknown;
}

interface ITranslation {
  language: string;
  title?: string;
  content?: string;
  excerpt?: string;
  customFieldsData?: ICustomFieldData[];
}

interface ITranslationData {
  title: string;
  content: string;
  excerpt: string;
  customFieldsData: ICustomFieldData[];
}

interface IPageDetail {
  _id: string;
  name?: string;
  slug?: string;
  description?: string;
  content?: string;
  status?: string;
  parentId?: string;
  thumbnail?: IAttachment | null;
  pageImages?: IAttachment[];
  video?: IAttachment | null;
  videoUrl?: string;
  audio?: IAttachment | null;
  documents?: IAttachment[];
  attachments?: IAttachment[];
  customFieldsData?: ICustomFieldData[];
}

export interface PageFormData {
  name: string;
  slug: string;
  description?: string;
  content?: string;
  status?: string;
  parentId?: string;
  thumbnail?: IAttachment | null;
  gallery?: string[];
  video?: string | null;
  videoUrl?: string;
  audio?: string | null;
  documents?: string[];
  attachments?: string[];
  pdf?: string | null;
  customFieldsData?: ICustomFieldData[];
}

interface IDefaultLangData {
  name: string;
  content: string;
  description: string;
  customFieldsData: ICustomFieldData[];
}

export const usePageForm = (editingPage?: IPageDetail) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [translations, setTranslations] = useState<
    Record<string, ITranslationData>
  >({});
  const [defaultLangData, setDefaultLangData] =
    useState<IDefaultLangData | null>(null);

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
      .replaceAll(/[^a-z0-9]+/g, '-')
      .replaceAll(/(^-|-$)/g, '');

  const { data: fullPageData } = useQuery<{ cmsPage: IPageDetail }>(
    PAGE_DETAIL,
    {
      variables: { id: editingPage?._id },
      skip: !editingPage?._id,
      fetchPolicy: 'cache-first',
      notifyOnNetworkStatusChange: false,
    },
  );

  const fullPage: IPageDetail | undefined =
    fullPageData?.cmsPage || editingPage;

  const { data: translationsData } = useQuery<{
    cmsTranslations: ITranslation[];
  }>(CMS_TRANSLATIONS, {
    variables: { postId: editingPage?._id },
    skip: !editingPage?._id,
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: false,
  });

  const [saveTranslation] = useMutation(CMS_EDIT_TRANSLATION);

  useEffect(() => {
    if (translationsData?.cmsTranslations) {
      const translationsMap: Record<string, ITranslationData> = {};
      translationsData.cmsTranslations.forEach((t) => {
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
        gallery: (fullPage.pageImages || []).map((i) => i.url).filter(Boolean),
        video: (fullPage.video && fullPage.video.url) || null,
        videoUrl: fullPage.videoUrl || '',
        audio: (fullPage.audio && fullPage.audio.url) || null,
        documents: (fullPage.documents || []).map((d) => d.url).filter(Boolean),
        attachments: (fullPage.attachments || [])
          .map((a) => a.url)
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

  const updateCustomFieldValue = (fieldId: string, value: unknown) => {
    const currentData = form.getValues('customFieldsData') || [];
    const existingIndex = currentData.findIndex(
      (item) => item.field === fieldId,
    );

    let updated: ICustomFieldData[];
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

  const getCustomFieldValue = (fieldId: string): unknown => {
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
